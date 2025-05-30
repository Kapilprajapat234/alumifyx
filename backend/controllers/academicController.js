// Define academic controller functions here

const getCourses = (req, res) => {
  // Dummy course data
  const courses = [
    { id: 1, title: 'BCA', description: 'Bachelor of Computer Applications' },
    { id: 2, title: 'BBA', description: 'Bachelor of Business Administration' },
    { id: 3, title: 'B.Com', description: 'Bachelor of Commerce' },
    { id: 4, title: 'MBA', description: 'Master of Business Administration' },
    { id: 5, title: 'MCA', description: 'Master of Computer Applications' },
    { id: 6, title: 'M.Com', description: 'Master of Commerce' },
    { id: 7, title: 'B.Tech', description: 'Bachelor of Technology' }
  ];
  res.json(courses);
};

const getSubjectsByCourse = (req, res) => {
  const course = req.params.course;
  // Dummy subject data based on course (matching the structure in subjects.html)
  const subjectsData = {
    "BCA": {
      "1": ["c Programming", "Mathematics ", "web devlopment" , "Computer Fundamentals" , "environmental Studies", "tacnical communication"],
      "2": ["Data Structures", , "Computer Organization"],
      "3": ["OOP with C++", "Database Management", "Operating Systems"],
      "4": ["Java Programming", "Software Engineering", "Computer Networks"],
      "5": ["Web Development", "Python Programming", "Cloud Computing"],
      "6": ["Mobile App Development", "Cyber Security", "AI Basics"]
    },
    "BBA": {
      "1": ["Principles of Management", "Business Economics", "Financial Accounting"],
      "2": ["Marketing Management", "Business Statistics", "Organizational Behavior"],
      "3": ["Human Resource Management", "Business Law", "Cost Accounting"],
      "4": ["Financial Management", "Operations Management", "Entrepreneurship"],
      "5": ["Strategic Management", "International Business", "Consumer Behavior"],
      "6": ["Business Ethics", "Project Management", "E-Commerce"]
    },
    "B.Com": {
      "1": ["Financial Accounting", "Business Organization", "Microeconomics"],
      "2": ["Corporate Accounting", "Business Statistics", "Macroeconomics"],
      "3": ["Cost Accounting", "Business Law", "Income Tax"],
      "4": ["Management Accounting", "Auditing", "Financial Markets"],
      "5": ["Indirect Taxes", "Corporate Finance", "International Trade"],
      "6": ["GST", "Investment Management", "Business Ethics"]
    },
    "MBA": {
      "1": ["Organizational Behavior", "Managerial Economics", "Accounting for Managers"],
      "2": ["Marketing Management", "Financial Management", "Operations Research"],
      "3": ["Strategic Management", "Human Resource Management", "Business Analytics"],
      "4": ["International Business", "Entrepreneurship", "Supply Chain Management"]
    },
    "MCA": {
      "1": ["Advanced Programming", "Discrete Mathematics", "System Analysis"],
      "2": ["Data Structures & Algorithms", "Database Systems", "Network Security"],
      "3": ["Software Engineering", "Cloud Computing", "Machine Learning"],
      "4": ["Big Data Analytics", "IoT", "Advanced Web Technologies"]
    },
    "M.Com": {
      "1": ["Advanced Financial Accounting", "Business Environment", "Economic Analysis"],
      "2": ["Corporate Tax Planning", "International Finance", "Strategic Management"],
      "3": ["Financial Risk Management", "E-Commerce", "Research Methodology"],
      "4": ["Investment Analysis", "Corporate Governance", "Global Trade"]
    },
    "B.Tech": {
      "1": ["Engineering Mathematics I", "Physics", "Basic Electrical Engineering"],
      "2": ["Engineering Mathematics II", "Chemistry", "Basic Mechanical Engineering"],
      "3": ["Data Structures", "Digital Logic Design", "Circuit Theory"],
      "4": ["Algorithms", "Microprocessors", "Signals and Systems"],
      "5": ["Operating Systems", "Database Systems", "Control Systems"],
      "6": ["Computer Networks", "Embedded Systems", "VLSI Design"],
      "7": ["Machine Learning", "Cloud Computing", "Robotics"],
      "8": ["AI and Deep Learning", "Cyber Security", "IoT"]
    }
  };

  const subjectsInCourse = subjectsData[course];
  
  if (!subjectsInCourse) {
    return res.status(404).json({ error: 'Course not found' });
  }

  // Flatten the subjects from all semesters for the course
  const allSubjects = Object.values(subjectsInCourse).flat().filter(subject => subject);

  res.json(allSubjects);
};

const getChaptersBySubject = (req, res) => {
  const { subject } = req.params;
  
  // Dummy chapter data based on subject
  const chaptersData = {
    'c Programming': ['Introduction to C', 'Variables and Data Types', 'Operators', 'Control Structures', 'Functions', 'Arrays', 'Pointers', 'Structures', 'File Handling'],
    'Mathematics': ['Algebra', 'Calculus', 'Geometry', 'Statistics', 'Probability', 'Linear Algebra', 'Differential Equations'],
    'web devlopment': ['HTML Basics', 'CSS Styling', 'JavaScript Fundamentals', 'DOM Manipulation', 'Responsive Design', 'Frontend Frameworks', 'Backend Integration'],
    'Computer Fundamentals': ['Computer Architecture', 'Operating Systems', 'Networking Basics', 'Database Concepts', 'Software Engineering'],
    'environmental Studies': ['Ecosystems', 'Biodiversity', 'Climate Change', 'Sustainable Development', 'Environmental Laws'],
    'tacnical communication': ['Business Writing', 'Presentation Skills', 'Technical Documentation', 'Professional Communication', 'Cross-cultural Communication'],
    'Data Structures': ['Arrays', 'Linked Lists', 'Stacks and Queues', 'Trees', 'Graphs', 'Sorting Algorithms', 'Searching Algorithms'],
    'Computer Organization': ['Digital Logic', 'Computer Architecture', 'Memory Systems', 'I/O Systems', 'Assembly Language'],
    'OOP with C++': ['Classes and Objects', 'Inheritance', 'Polymorphism', 'Encapsulation', 'Templates', 'STL'],
    'Database Management': ['SQL Basics', 'Normalization', 'ER Diagrams', 'Transactions', 'Indexing', 'Query Optimization'],
    'Operating Systems': ['Process Management', 'Memory Management', 'File Systems', 'Scheduling', 'Deadlocks', 'Security'],
    'Java Programming': ['Java Basics', 'OOP in Java', 'Collections', 'Exception Handling', 'Multithreading', 'JDBC'],
    'Software Engineering': ['SDLC', 'Requirements Engineering', 'Design Patterns', 'Testing', 'Project Management', 'Agile'],
    'Computer Networks': ['Network Models', 'Protocols', 'Routing', 'Security', 'Wireless Networks', 'Cloud Computing'],
    'Web Development': ['HTML5', 'CSS3', 'JavaScript ES6+', 'React.js', 'Node.js', 'MongoDB', 'REST APIs'],
    'Python Programming': ['Python Basics', 'Data Structures', 'OOP in Python', 'File Handling', 'Modules', 'Web Development'],
    'Cloud Computing': ['Cloud Models', 'AWS', 'Azure', 'Google Cloud', 'Serverless', 'DevOps', 'Containerization'],
    'Mobile App Development': ['Android Development', 'iOS Development', 'React Native', 'Flutter', 'App Design', 'App Store'],
    'Cyber Security': ['Network Security', 'Cryptography', 'Ethical Hacking', 'Security Tools', 'Incident Response', 'Compliance'],
    'AI Basics': ['Machine Learning', 'Neural Networks', 'Deep Learning', 'NLP', 'Computer Vision', 'AI Ethics']
  };

  const chapters = chaptersData[subject];
  
  if (!chapters) {
    return res.status(404).json({ error: 'Subject not found' });
  }

  res.json(chapters);
};

const getResourcesByChapter = (req, res) => {
  const { subject, chapter } = req.params;
  
  // Dummy resource data based on subject and chapter
  const resourcesData = {
    'c Programming': {
      'Introduction to C': [
        { type: 'pdf', title: 'C Programming Basics', url: 'https://example.com/c_basics.pdf' },
        { type: 'video', title: 'C Programming Intro', url: 'https://www.youtube.com/embed/c_intro' }
      ],
      'Variables and Data Types': [
        { type: 'pdf', title: 'Variables and Data Types in C', url: 'https://example.com/variables.pdf' }
      ],
      'Operators': [
        { type: 'pdf', title: 'C Operators Guide', url: 'https://example.com/operators.pdf' }
      ],
      'Control Structures': [
        { type: 'pdf', title: 'Control Structures in C', url: 'https://example.com/control_structures.pdf' }
      ],
      'Functions': [
        { type: 'pdf', title: 'Functions in C', url: 'https://example.com/functions.pdf' }
      ],
      'Arrays': [
        { type: 'pdf', title: 'Arrays in C', url: 'https://example.com/arrays.pdf' }
      ],
      'Pointers': [
        { type: 'pdf', title: 'Pointers in C', url: 'https://example.com/pointers.pdf' }
      ],
      'Structures': [
        { type: 'pdf', title: 'Structures in C', url: 'https://example.com/structures.pdf' }
      ],
      'File Handling': [
        { type: 'pdf', title: 'File Handling in C', url: 'https://example.com/file_handling.pdf' }
      ]
    },
    'Mathematics': {
      'Algebra': [
        { type: 'pdf', title: 'Algebra Basics', url: 'https://example.com/algebra.pdf' }
      ],
      'Calculus': [
        { type: 'pdf', title: 'Calculus Fundamentals', url: 'https://example.com/calculus.pdf' }
      ],
      'Geometry': [
        { type: 'pdf', title: 'Geometry Concepts', url: 'https://example.com/geometry.pdf' }
      ],
      'Statistics': [
        { type: 'pdf', title: 'Statistics Basics', url: 'https://example.com/statistics.pdf' }
      ],
      'Probability': [
        { type: 'pdf', title: 'Probability Theory', url: 'https://example.com/probability.pdf' }
      ],
      'Linear Algebra': [
        { type: 'pdf', title: 'Linear Algebra Guide', url: 'https://example.com/linear_algebra.pdf' }
      ],
      'Differential Equations': [
        { type: 'pdf', title: 'Differential Equations', url: 'https://example.com/diff_equations.pdf' }
      ]
    },
    'web devlopment': {
      'HTML Basics': [
        { type: 'pdf', title: 'HTML Introduction', url: 'https://example.com/html_basics.pdf' }
      ],
      'CSS Styling': [
        { type: 'pdf', title: 'CSS Fundamentals', url: 'https://example.com/css_basics.pdf' }
      ],
      'JavaScript Fundamentals': [
        { type: 'pdf', title: 'JavaScript Introduction', url: 'https://example.com/javascript_basics.pdf' }
      ],
      'DOM Manipulation': [
        { type: 'pdf', title: 'DOM Manipulation Guide', url: 'https://example.com/dom.pdf' }
      ],
      'Responsive Design': [
        { type: 'pdf', title: 'Responsive Web Design', url: 'https://example.com/responsive.pdf' }
      ],
      'Frontend Frameworks': [
        { type: 'pdf', title: 'Frontend Frameworks Overview', url: 'https://example.com/frameworks.pdf' }
      ],
      'Backend Integration': [
        { type: 'pdf', title: 'Backend Integration Guide', url: 'https://example.com/backend.pdf' }
      ]
    }
    // Add more subjects and their resources as needed
  };

  const subjectResources = resourcesData[subject];
  
  if (!subjectResources) {
    return res.status(404).json({ error: 'Subject not found' });
  }

  const chapterResources = subjectResources[chapter];
  
  if (!chapterResources) {
    return res.status(404).json({ error: 'Chapter not found' });
  }

  res.json(chapterResources);
};

module.exports = {
  getCourses,
  getSubjectsByCourse,
  getChaptersBySubject,
  getResourcesByChapter
}; 