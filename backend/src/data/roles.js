/**
 * Predefined Target Roles for Skill Gap Analysis
 */
module.exports = {
    roles: [
        {
            id: 'fullstack',
            label: 'Full Stack Developer',
            description: 'Modern web development stack',
            axes: [
                { name: 'Frontend', skills: ['react', 'angular', 'vue', 'html', 'css', 'javascript', 'typescript', 'redux', 'tailwind'] },
                { name: 'Backend', skills: ['node.js', 'express', 'python', 'java', 'go', 'ruby', 'php', 'django', 'spring'] },
                { name: 'Database', skills: ['mongodb', 'sql', 'postgresql', 'mysql', 'redis', 'firebase'] },
                { name: 'DevOps', skills: ['git', 'docker', 'kubernetes', 'aws', 'ci/cd', 'jenkins', 'linux'] },
                { name: 'Architecture', skills: ['rest api', 'graphql', 'microservices', 'system design', 'testing'] }
            ]
        },
        {
            id: 'datascience',
            label: 'Data Scientist',
            description: 'Data analysis and machine learning',
            axes: [
                { name: 'Languages', skills: ['python', 'r', 'sql', 'scala', 'julia'] },
                { name: 'ML/AI', skills: ['tensorflow', 'pytorch', 'scikit-learn', 'deep learning', 'nlp', 'computer vision'] },
                { name: 'Data Eng', skills: ['pandas', 'numpy', 'spark', 'hadoop', 'kafka', 'etl'] },
                { name: 'Visualization', skills: ['tableau', 'powerbi', 'matplotlib', 'seaborn', 'd3'] },
                { name: 'Math', skills: ['statistics', 'probability', 'linear algebra', 'calculus'] }
            ]
        },
        {
            id: 'android',
            label: 'Android Developer',
            description: 'Mobile app development for Android',
            axes: [
                { name: 'Core', skills: ['java', 'kotlin', 'android sdk', 'xml'] },
                { name: 'Architecture', skills: ['mvvm', 'mvc', 'clean architecture', 'jetpack compose'] },
                { name: 'Networking', skills: ['retrofit', 'okhttp', 'graphql', 'rest api'] },
                { name: 'Persistence', skills: ['room', 'sqlite', 'realm', 'firebase'] },
                { name: 'Tools', skills: ['git', 'gradle', 'android studio', 'junit'] }
            ]
        }
    ]
}
