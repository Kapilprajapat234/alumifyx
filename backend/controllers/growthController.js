// Define growth controller functions here

const getSkillById = (req, res) => {
  const { id } = req.params;
  // Dummy skill data (matching the structure in skill.html)
  const skillData = {
    'personal_finance': {
      title: 'Personal Finance',
      description: 'Master the art of managing your money effectively with our Personal Finance course. Learn budgeting, saving, and investing strategies to achieve financial freedom.',
      youtube: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual video ID
      pdf: 'https://example.com/personal_finance.pdf'
    },
    'stock_market': {
      title: 'Stock Market',
      description: 'Dive into the world of stocks and investments. Understand market trends, trading strategies, and portfolio management.',
      youtube: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual video ID
      pdf: 'https://example.com/stock_market.pdf'
    },
    'tax_saving': {
      title: 'Tax Saving',
      description: 'Learn how to minimize your tax liabilities legally with expert tips on deductions, exemptions, and investments.',
      youtube: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual video ID
      pdf: 'https://example.com/tax_saving.pdf'
    },
    'credit_card_course': {
      title: 'Credit Card Course',
      description: 'Understand how to use credit cards wisely, manage debt, and maximize rewards without falling into traps.',
      youtube: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual video ID
      pdf: 'https://example.com/credit_card_course.pdf'
    },
    'tally': {
      title: 'Tally',
      description: 'Become proficient in Tally for accounting and financial management with hands-on training.',
      youtube: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual video ID
      pdf: 'https://example.com/tally.pdf'
    },
    'sales': {
      title: 'Sales',
      description: 'Learn proven sales techniques to boost your performance and close deals effectively.',
      youtube: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual video ID
      pdf: 'https://example.com/sales.pdf'
    },
    'marketing': {
      title: 'Marketing',
      description: 'Explore digital and traditional marketing strategies to grow your brand and reach your audience.',
      youtube: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual video ID
      pdf: 'https://example.com/marketing.pdf'
    },
    'personal_development': {
      title: 'Personal Development',
      description: 'Unlock your potential with skills in time management, goal setting, and self-discipline.',
      youtube: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual video ID
      pdf: 'https://example.com/personal_development.pdf'
    },
    'video_editing': {
      title: 'Video Editing',
      description: 'Create professional videos with our course on editing techniques using industry-standard software.',
      youtube: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual video ID
      pdf: 'https://example.com/video_editing.pdf'
    },
    'vibe_coding': {
      title: 'Vibe Coding',
      description: 'Learn coding with a fun, creative approach to building apps and websites that stand out.',
      youtube: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual video ID
      pdf: 'https://example.com/vibe_coding.pdf'
    },
    'graphic_design': {
      title: 'Graphic Design',
      description: 'Design stunning visuals with tools like Photoshop and Illustrator in our comprehensive course.',
      youtube: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual video ID
      pdf: 'https://example.com/graphic_design.pdf'
    },
    'python': {
      title: 'Python',
      description: 'Learn Python programming for data analysis, web development, and automation.',
      youtube: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual video ID
      pdf: 'https://example.com/python.pdf'
    },
    'web_development': {
      title: 'Web Development',
      description: 'Build modern, responsive websites with HTML, CSS, and JavaScript.',
      youtube: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual video ID
      pdf: 'https://example.com/web_development.pdf'
    },
    'programming': {
      title: 'Programming',
      description: 'Master the fundamentals of programming with hands-on projects in various languages.',
      youtube: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual video ID
      pdf: 'https://example.com/programming.pdf'
    },
    'ui_ux': {
      title: 'UI/UX',
      description: 'Design user-friendly interfaces and experiences with our UI/UX course.',
      youtube: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual video ID
      pdf: 'https://example.com/ui_ux.pdf'
    }
  };

  const skill = skillData[id];

  if (!skill) {
    return res.status(404).json({ error: 'Skill not found' });
  }

  res.json(skill);
};

const getRecordedClasses = (req, res) => {
  // Dummy recorded class data (matching the structure in recorded-classes.html)
  const recordedClasses = [
    {
      title: 'Recorded Class 1',
      description: 'Introduction to Financial Planning',
      video: 'https://www.w3schools.com/html/mov_bbb.mp4' // Replace with actual video URL
    },
    {
      title: 'Recorded Class 2',
      description: 'Basics of Stock Trading',
      video: 'https://www.w3schools.com/html/mov_bbb.mp4' // Replace with actual video URL
    },
    {
      title: 'Recorded Class 3',
      description: 'Understanding Tax Deductions',
      video: 'https://www.w3schools.com/html/mov_bbb.mp4' // Replace with actual video URL
    }
    // Add more recorded classes as needed
  ];
  res.json(recordedClasses);
};

const getLiveClasses = (req, res) => {
  // Dummy live class data (matching the structure in live-classes.html)
  const liveClasses = [
    {
      title: 'Live Session: Q&A on Personal Finance',
      date: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
      description: 'Join our expert for a live Q&A on personal finance topics.',
      link: 'https://meet.google.com/abc-defg-hij' // Replace with actual meeting link
    },
    {
      title: 'Upcoming Webinar: Advanced Stock Trading Strategies',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      description: 'Learn advanced techniques for trading in the stock market.',
      link: 'https://meet.google.com/abc-defg-hij' // Replace with actual meeting link
    }
    // Add more live classes as needed
  ];
  res.json(liveClasses);
};

module.exports = {
  getSkillById,
  getRecordedClasses,
  getLiveClasses
}; 