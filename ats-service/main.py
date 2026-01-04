from fastapi import FastAPI, UploadFile, File, Form
from typing import Optional, Dict, Any
import io
import re
import traceback

from pdfminer.high_level import extract_text as extract_text_from_pdf
import docx
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

app = FastAPI(title="ATS Service (Phase 1)")


@app.get('/health')
def health():
    return {'status': 'ok'}


def extract_text_from_docx_bytes(data: bytes) -> str:
    try:
        doc = docx.Document(io.BytesIO(data))
        full_text = []
        for para in doc.paragraphs:
            full_text.append(para.text)
        return '\n'.join(full_text)
    except Exception:
        raise


def safe_extract_text(file_bytes: bytes, filename: str) -> (str, list):
    errors = []
    text = ''
    lower = filename.lower()
    try:
        if lower.endswith('.pdf'):
            # pdfminer expects a file-like; write to BytesIO
            try:
                text = extract_text_from_pdf(io.BytesIO(file_bytes))
            except Exception as e:
                errors.append(f'PDF parsing error: {str(e)}')
        elif lower.endswith('.docx') or lower.endswith('.doc'):
            try:
                text = extract_text_from_docx_bytes(file_bytes)
            except Exception as e:
                errors.append(f'DOCX parsing error: {str(e)}')
        else:
            errors.append('Unsupported file extension')
    except Exception as e:
        errors.append(f'Unexpected parsing error: {str(e)}')
    text = text or ''
    return text, errors


def find_section(text: str, section_names) -> Optional[str]:
    # naive section detection: look for lines starting with section name
    lines = text.splitlines()
    idx = None
    for i, ln in enumerate(lines):
        l = ln.strip().lower()
        for name in section_names:
            if l.startswith(name):
                idx = i
                break
        if idx is not None:
            break
    if idx is None:
        return None
    # collect lines until next blank line or next header (all caps or ends with ':')
    collected = []
    for ln in lines[idx + 1:]:
        if not ln.strip():
            if collected:
                break
            else:
                continue
        # simple header heuristic
        if re.match(r'^[A-Z\s]{3,}$', ln.strip()) or ln.strip().endswith(':'):
            break
        collected.append(ln.strip())
    return '\n'.join(collected).strip() if collected else None


def extract_contact_info(text: str) -> Dict[str, Optional[str]]:
    email_re = re.compile(r'[\w\.-]+@[\w\.-]+')
    phone_re = re.compile(r'(\+?\d[\d\s\-()]{6,}\d)')
    email = email_re.search(text)
    phone = phone_re.search(text)
    return {'email': email.group(0) if email else None, 'phone': phone.group(0) if phone else None}


def extract_skills_from_section(section_text: Optional[str]) -> list:
    if not section_text:
        return []
    # split by commas or newlines and filter short tokens
    tokens = re.split(r'[\n,;•\u2022]+', section_text)
    skills = []
    for t in tokens:
        s = t.strip()
        if 2 <= len(s) <= 60:
            skills.append(s)
    return skills


def detect_formatting_risks(text: str) -> list:
    risks = []
    lines = [ln for ln in text.splitlines() if ln.strip()]
    if not lines:
        risks.append('Empty or unreadable document')
        return risks
    long_line_ratio = sum(1 for ln in lines if len(ln) > 300) / max(1, len(lines))
    if long_line_ratio > 0.2:
        risks.append('Many very long lines (possible formatting/encoding issues)')
    all_caps_ratio = sum(1 for ln in lines if ln.strip().isupper()) / max(1, len(lines))
    if all_caps_ratio > 0.1:
        risks.append('Excessive ALL-CAPS lines')
    return risks


def compute_heuristics(text: str, parsed_sections: dict, parsing_errors: list) -> (float, list, dict):
    # Heuristic scoring (0-50). We'll return score and feedback items and breakdown
    score = 0.0
    feedback = []
    breakdown = {'education': 0, 'experience': 0, 'skills': 0, 'contact': 0, 'formattingPenalty': 0, 'parsingPenalty': 0}

    # Education
    if parsed_sections.get('education'):
        breakdown['education'] = 12
        score += 12
    else:
        feedback.append('Missing Education section')

    # Experience
    if parsed_sections.get('experience'):
        breakdown['experience'] = 18
        score += 18
    else:
        feedback.append('Missing Experience section')

    # Skills
    if parsed_sections.get('skills'):
        breakdown['skills'] = 10
        score += 10
    else:
        feedback.append('Missing Skills section')

    # Contact
    contact = extract_contact_info(text)
    if contact.get('email') or contact.get('phone'):
        breakdown['contact'] = 10
        score += 10
    else:
        feedback.append('Missing or invalid contact information')

    # Formatting risks
    risks = detect_formatting_risks(text)
    if risks:
        breakdown['formattingPenalty'] = -10
        score -= 10
        feedback.extend(['Formatting risk: ' + r for r in risks])

    # Parsing errors penalty
    if parsing_errors:
        breakdown['parsingPenalty'] = -20
        score -= 20
        feedback.append('Parsing issues detected: ' + '; '.join(parsing_errors))

    # Clamp
    score = max(0.0, min(50.0, score))
    return score, feedback, breakdown


def compute_relevance(resume_text: str, job_text: str) -> float:
    try:
        vect = TfidfVectorizer(stop_words='english')
        tfidf = vect.fit_transform([job_text or '', resume_text or ''])
        if tfidf.shape[0] < 2:
            return 0.0
        sim = cosine_similarity(tfidf[0:1], tfidf[1:2])[0, 0]
        if np.isnan(sim):
            return 0.0
        return float(sim)
    except Exception:
        return 0.0


def normalize_score(heuristics_score: float, relevance: Optional[float]) -> (float, dict):
    # heuristics_score in [0,50]
    # relevance in [0,1] or None
    if relevance is None or relevance == 0.0:
        total = heuristics_score * 2.0
        breakdown = {'heuristics': heuristics_score * 2.0, 'relevance': 0.0}
    else:
        relevance_component = relevance * 50.0
        total = heuristics_score + relevance_component
        breakdown = {'heuristics': heuristics_score, 'relevance': relevance_component}
    total = max(0.0, min(100.0, total))
    return round(total, 2), breakdown


def generate_white_box_feedback(feedback_items: list, relevance: float, parsed_sections: dict, contact: dict, breakdown_components: dict) -> list:
    fb = []
    fb.extend(feedback_items)
    # Add relevance interpretation
    if relevance is not None:
        fb.append(f'Relevance (TF-IDF cosine) = {round(relevance,3)}')
        if relevance < 0.2:
            fb.append('Low semantic match to job description')
        elif relevance < 0.5:
            fb.append('Moderate semantic match to job description')
        else:
            fb.append('Good semantic match to job description')

    # Section summary
    for sec in ['education', 'experience', 'skills']:
        if parsed_sections.get(sec):
            fb.append(f'{sec.title()} section detected')
        else:
            fb.append(f'{sec.title()} section NOT detected')

    if contact.get('email'):
        fb.append(f"Email found: {contact.get('email')}")
    else:
        fb.append('Email not found')
    if contact.get('phone'):
        fb.append(f"Phone found: {contact.get('phone')}")
    else:
        fb.append('Phone not found')

    # Append breakdown summary
    fb.append('Score breakdown: ' + ', '.join([f"{k}:{v}" for k, v in breakdown_components.items()]))
    return fb


@app.post('/parse')
async def parse_resume(file: UploadFile = File(...), job_description: Optional[str] = Form(None)) -> Dict[str, Any]:
    """
    Parse and score a resume file (PDF or DOCX).
    Optional `job_description` form field may be provided to compute semantic relevance.
    Returns rawText, parsed sections, parsingErrors, atsScore (0-100), breakdown, and feedback.
    """
    try:
        data = await file.read()
        raw_text, parsing_errors = safe_extract_text(data, file.filename)

        # Extract sections
        parsed = {}
        parsed['skills'] = extract_skills_from_section(find_section(raw_text, ['skills', 'technical skills', 'skills & technologies']))
        parsed['education'] = find_section(raw_text, ['education', 'academic', 'qualifications'])
        parsed['experience'] = find_section(raw_text, ['experience', 'work experience', 'professional experience', 'employment'])

        heur_score, heur_feedback, heur_breakdown = compute_heuristics(raw_text, parsed, parsing_errors)

        relevance = None
        if job_description:
            relevance = compute_relevance(raw_text, job_description)

        final_score, norm_breakdown = normalize_score(heur_score, relevance)

        contact = extract_contact_info(raw_text)
        feedback = generate_white_box_feedback(heur_feedback, relevance if relevance is not None else 0.0, parsed, contact, {**heur_breakdown, **norm_breakdown})

        result = {
            'rawText': raw_text,
            'parsedSkills': parsed['skills'],
            'parsingErrors': parsing_errors,
            'atsScore': final_score,
            'breakdown': {**heur_breakdown, **norm_breakdown},
            'feedback': feedback,
            'contact': contact,
        }
        return result
    except Exception as e:
        traceback.print_exc()
        return {'error': 'Failed to parse', 'detail': str(e)}
