bird1 = "/course-images/bird1.webp"
bird2 = "/course-images/bird2.webp"
bird3 = "/course-images/bird3.webp"
bird4 = "/course-images/bird4.webp"
bird5 = "/course-images/bird5.webp"
bird6 = "/course-images/bird6.webp"
bunny1 = "/course-images/bunny1.webp"
bunny2 = "/course-images/bunny2.webp"
bunny3 = "/course-images/bunny3.webp"
bunny4 = "/course-images/bunny4.webp"
bunny5 = "/course-images/bunny5.webp"
bunny7 = "/course-images/bunny7.webp"
bunny8 = "/course-images/bunny8.webp"
bunny6 = "/course-images/bunny6.webp"
cat1 = "/course-images/cat1.webp"
cat2 = "/course-images/cat2.webp"
cat3 = "/course-images/cat3.webp"
cat4 = "/course-images/cat4.webp"
cat5 = "/course-images/cat5.webp"
cat6 = "/course-images/cat6.webp"
cat7 = "/course-images/cat7.webp"
cat8 = "/course-images/cat8.webp"
dog1 = "/course-images/dog1.webp"
dog2 = "/course-images/dog2.webp"
dog3 = "/course-images/dog3.webp"
dog4 = "/course-images/dog4.webp"
dog5 = "/course-images/dog5.webp"
dog6 = "/course-images/dog6.webp"
image1 = "/course-images/image1.webp"
image2 = "/course-images/image2.webp"
image3 = "/course-images/image3.webp"
image5 = "/course-images/image5.webp"
image4 = "/course-images/image4.svg"
image6 = "/course-images/image6.svg"

QUIZ_INSTRUCTIONS = 'Answer each multiple-choice question below. Your answers are kept as you go, and you can jump to any question from the sidebar. Submit when you are done to see your score and the correct answers.'

courses = [
  {
    "id": 1,
    "code": "CS-101",
    "title": "Intro to Web Development",
    "instructor": "Dr. Nolan",
    "category": "Programming",
    "enrolled": True,
    "startDate": 1767225600000,
    "image": image1,
    "dogimage": dog1,
    "catimage": cat1,
    "birdimage": bird1,
    "bunnyimage": bunny1,
    "catnbunnyimage": cat7,
    "lessons": [
      { "id": 1, "title": "How the Web Works", "points": 10, "completed": True, "completed_points": 7, "due": 1794639540000, "minigame": "snake" },
      { "id": 2, "title": "HTML Fundamentals", "points": 10, "completed": True, "completed_points": 8, "due": 1794812340000, "minigame": "snake" },
      { "id": 3, "title": "Styling with CSS", "points": 10, "completed": False, "completed_points": 0, "due": 1795071540000, "minigame": "snake" },
      { "id": 4, "title": "Flexbox & Grid", "points": 15, "completed": False, "completed_points": 0, "due": 1795244340000, "minigame": "snake" },
      { "id": 5, "title": "JavaScript Basics", "points": 15, "completed": False, "completed_points": 0, "due": 1795417140000, "minigame": "minesweeper" },
      { "id": 6, "title": "DOM Manipulation", "points": 15, "completed": False, "completed_points": 0, "due": 1795589940000, "minigame": "minesweeper" },
      { "id": 7, "title": "Fetch & APIs", "points": 20, "completed": False, "completed_points": 0, "due": 1795849140000, "minigame": "minesweeper" },
      { "id": 8, "title": "Deploying a Site", "points": 10, "completed": False, "completed_points": 0, "due": 1796021940000, "minigame": "snake" },
    ],
    "quiz": {
      "id": 10,
      "title": "CS-101 Web Fundamentals Quiz",
      "instructions": QUIZ_INSTRUCTIONS,
      "due": 1795244340000,
      "time_limit": 10,
      "completed_points": None,
      "questions": [
        {
          "q": "Which HTML tag is used for the largest heading?",
          "options": ["<head>", "<h6>", "<h1>", "<header>"],
          "answer": 2,
          "points": 10,
        },
        {
          "q": "What does CSS stand for?",
          "options": ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Syntax", "Colorful Style Sheets"],
          "answer": 1,
          "points": 10,
        },
        {
          "q": "Which keyword declares a constant in JavaScript?",
          "options": ["var", "let", "const", "static"],
          "answer": 2,
          "points": 10,
        },
        {
          "q": "What does the DOM stand for?",
          "options": ["Document Object Model", "Data Object Map", "Display Output Mode", "Digital Order Model"],
          "answer": 0,
          "points": 10,
        },
        {
          "q": "Which method adds an item to the end of an array?",
          "options": ["shift()", "push()", "pop()", "unshift()"],
          "answer": 1,
          "points": 10
        }
      ]
    }
  },
  {
    "id": 2,
    "code": "DS-210",
    "title": "Data Science with Python",
    "instructor": "Prof. Liam Chen",
    "category": "Data",
    "enrolled": True,
    "startDate": 1769904000000,
    "image": image2,
    "dogimage": dog2,
    "catimage": cat2,
    "birdimage": bird2,
    "bunnyimage": bunny2,
    "catnbunnyimage": bunny7,
    "lessons": [
      { "id": 1, "title": "Python Refresher", "points": 10, "completed": True, "completed_points": 9, "due": 1794639540000, "minigame": "minesweeper" },
      { "id": 2, "title": "NumPy Arrays", "points": 10, "completed": True, "completed_points": 9, "due": 1794898740000, "minigame": "snake" },
      { "id": 3, "title": "Pandas DataFrames", "points": 15, "completed": True, "completed_points": 9, "due": 1795157940000, "minigame": "minesweeper" },
      { "id": 4, "title": "Data Cleaning", "points": 15, "completed": False, "completed_points": 0, "due": 1795503540000, "minigame": "minesweeper" },
      { "id": 5, "title": "Visualization with Matplotlib", "points": 15, "completed": False, "completed_points": 0, "due": 1795762740000, "minigame": "minesweeper" },
      { "id": 6, "title": "Intro to Regression", "points": 20, "completed": False, "completed_points": 0, "due": 1796021940000, "minigame": "minesweeper" },
    ],
    "quiz": {
      "id": 20,
      "title": "DS-210 Python Data Tools Quiz",
      "instructions": QUIZ_INSTRUCTIONS,
      "due": 1795589940000,
      "time_limit": 15,
      "completed_points": None,
      "questions": [
        {
          "q": "Which library provides the DataFrame type?",
          "options": ["NumPy", "pandas", "Matplotlib", "SciPy"],
          "answer": 1,
          "points": 10,
        },
        {
          "q": "What does np.arange(5) return?",
          "options": ["[1, 2, 3, 4, 5]", "[0, 1, 2, 3, 4]", "[0, 1, 2, 3, 4, 5]", "5"],
          "answer": 1,
          "points": 10,
        },
        {
          "q": "Which pandas method shows the first rows of a DataFrame?",
          "options": ["first()", "top()", "head()", "peek()"],
          "answer": 2,
          "points": 10,
        },
        {
          "q": "What is the result of 7 // 2 in Python?",
          "options": ["3.5", "3", "4", "1"],
          "answer": 1,
          "points": 10,
        },
        {
          "q": "Which pandas method removes rows with missing values?",
          "options": ["dropna()", "fillna()", "isna()", "remove()"],
          "answer": 0,
          "points": 10,
        },
      ],
    },
  },
  {
    "id": 3,
    "code": "UX-150",
    "title": "User Experience Design",
    "instructor": "Sofia Martínez",
    "category": "Design",
    "enrolled": False,
    "startDate": 1772323200000,
    "image": image3,
    "dogimage": dog3,
    "catimage": cat3,
    "birdimage": bird3,
    "bunnyimage": bunny3,
    "catnbunnyimage": cat8,
    "lessons": [
      { "id": 1, "title": "What is UX?", "points": 5, "completed": False, "completed_points": 0, "due": 1794639540000, "minigame": "minesweeper" },
      { "id": 2, "title": "User Research", "points": 10, "completed": False, "completed_points": 0, "due": 1794898740000, "minigame": "snake" },
      { "id": 3, "title": "Nielsen Heuristics", "points": 10, "completed": False, "completed_points": 0, "due": 1795071540000, "minigame": "snake" },
      { "id": 4, "title": "Wireframing", "points": 10, "completed": False, "completed_points": 0, "due": 1795330740000, "minigame": "snake" },
      { "id": 5, "title": "Prototyping", "points": 15, "completed": False, "completed_points": 0, "due": 1795589940000, "minigame": "minesweeper" },
      { "id": 6, "title": "Usability Testing", "points": 15, "completed": False, "completed_points": 0, "due": 1795762740000, "minigame": "snake" },
      { "id": 7, "title": "Accessibility", "points": 15, "completed": False, "completed_points": 0, "due": 1796021940000, "minigame": "minesweeper" },
    ],
    "quiz": {
      "id": 30,
      "title": "UX-150 UX Principles Quiz",
      "instructions": QUIZ_INSTRUCTIONS,
      "due": 1796021940000,
      "time_limit": 10,
      "completed_points": None,
      "questions": [
        {
          "q": "Which Nielsen heuristic covers keeping users informed about what is going on?",
          "options": ["Error prevention", "Visibility of system status", "Aesthetic and minimalist design", "Flexibility and efficiency of use"],
          "answer": 1,
          "points": 10,
        },
        {
          "q": "What is the main purpose of a wireframe?",
          "options": ["Final visual design", "Laying out structure and content", "Writing production code", "Running A/B tests"],
          "answer": 1,
          "points": 10,
        },
        {
          "q": "What is the WCAG AA minimum contrast ratio for normal body text?",
          "options": ["3:1", "4.5:1", "7:1", "2:1"],
          "answer": 1,
          "points": 10,
        },
        {
          "q": "In usability testing, what does 'think aloud' mean?",
          "options": ["Users narrate their thoughts while doing tasks", "The facilitator explains the design", "Users fill out a survey afterward", "The team discusses results"],
          "answer": 0,
          "points": 10,
        },
        {
          "q": "About how many users does Nielsen suggest finds most usability problems in one round?",
          "options": ["1", "5", "20", "100"],
          "answer": 1,
          "points": 10,
        },
      ]
    },
  },
  {
    "id": 4,
    "code": "MK-200",
    "title": "Digital Marketing Essentials",
    "instructor": "Hannah Becker",
    "category": "Business",
    "enrolled": False,
    "startDate": 1775001600000,
    "image": image4,
    "dogimage": dog4,
    "catimage": cat4,
    "birdimage": bird4,
    "bunnyimage": bunny4,
    "catnbunnyimage": bunny8,
    "lessons": [
      { "id": 1, "title": "Marketing Fundamentals", "points": 5, "completed": True, "completed_points": 3, "due": 1794639540000, "minigame": "minesweeper" },
      { "id": 2, "title": "SEO Basics", "points": 10, "completed": False, "completed_points": 0, "due": 1794898740000, "minigame": "snake" },
      { "id": 3, "title": "Content Marketing", "points": 10, "completed": False, "completed_points": 0, "due": 1795157940000, "minigame": "minesweeper" },
      { "id": 4, "title": "Social Media Strategy", "points": 10, "completed": False, "completed_points": 0, "due": 1795503540000, "minigame": "minesweeper" },
      { "id": 5, "title": "Email Campaigns", "points": 10, "completed": False, "completed_points": 0, "due": 1795762740000, "minigame": "snake" },
      { "id": 6, "title": "Analytics & KPIs", "points": 15, "completed": False, "completed_points": 0, "due": 1796021940000, "minigame": "snake" },
    ],
    "quiz": {
      "id": 40,
      "title": "MK-200 Marketing Basics Quiz",
      "instructions": QUIZ_INSTRUCTIONS,
      "due": 1794985140000,
      "time_limit": 10,
      "completed_points": None,
      "questions": [
        {
          "q": "What does SEO stand for?",
          "options": ["Search Engine Optimization", "Social Engagement Outreach", "Sales Efficiency Operations", "Site Error Overview"],
          "answer": 0,
          "points": 10,
        },
        {
          "q": "What does CTR measure?",
          "options": ["Cost per sale", "Clicks divided by impressions", "Total revenue", "Time on page"],
          "answer": 1,
          "points": 10,
        },
        {
          "q": "Which of these is an example of owned media?",
          "options": ["A paid search ad", "Your company\"s blog", "A news article about you", "A sponsored post"],
          "answer": 1,
          "points": 10,
        },
        {
          "q": "What is a conversion?",
          "options": ["A page view", "A user completing a desired action", "A social media share", "An ad impression"],
          "answer": 1,
          "points": 10,
        },
        {
          "q": "What does A/B testing compare?",
          "options": ["Two versions of something to see which performs better", "Two competitors", "Audience age groups", "Paid and organic traffic"],
          "answer": 0,
          "points": 10,
        },
      ],
    },
  },
  {
    "id": 5,
    "code": "ST-120",
    "title": "Statistics for Beginners",
    "instructor": "Dr. Raj Patel",
    "category": "Data",
    "enrolled": True,
    "startDate": 1767830400000,
    "image": image5,
    "dogimage": dog5,
    "catimage": cat5,
    "birdimage": bird5,
    "bunnyimage": bunny5,
    "catnbunnyimage": bunny6,
    "lessons": [
      { "id": 1, "title": "Descriptive Statistics", "points": 10, "completed": True, "completed_points": 5, "due": 1794639540000, "minigame": "minesweeper" },
      { "id": 2, "title": "Probability Basics", "points": 10, "completed": False, "completed_points": 0, "due": 1794898740000, "minigame": "snake" },
      { "id": 3, "title": "Distributions", "points": 15, "completed": False, "completed_points": 0, "due": 1795157940000, "minigame": "snake" },
      { "id": 4, "title": "Sampling", "points": 10, "completed": False, "completed_points": 0, "due": 1795503540000, "minigame": "snake" },
      { "id": 5, "title": "Hypothesis Testing", "points": 15, "completed": False, "completed_points": 0, "due": 1795762740000, "minigame": "snake" },
      { "id": 6, "title": "Correlation", "points": 15, "completed": False, "completed_points": 0, "due": 1796021940000, "minigame": "snake" },
    ],
    "quiz": {
      "id": 50,
      "title": "ST-120 Descriptive Statistics Quiz",
      "instructions": QUIZ_INSTRUCTIONS,
      "due": 1794725940000,
      "time_limit": 15,
      "completed_points": None,
      "questions": [
        {
          "q": "What is the median of 2, 5, 9, 11, 20?",
          "options": ["9", "11", "9.4", "5"],
          "answer": 0,
          "points": 10,
        },
        {
          "q": "Which measure is most affected by outliers?",
          "options": ["Median", "Mode", "Mean", "Interquartile range"],
          "answer": 2,
          "points": 10,
        },
        {
          "q": "What is the mode of 3, 7, 7, 2, 9?",
          "options": ["3", "7", "5.6", "9"],
          "answer": 1,
          "points": 10,
        },
        {
          "q": "Standard deviation measures…",
          "options": ["The center of the data", "How spread out the data is", "The most common value", "The number of data points"],
          "answer": 1,
          "points": 10,
        },
        {
          "q": "What is the range of 4, 8, 15, 16, 23?",
          "options": ["19", "23", "13.2", "15"],
          "answer": 0,
          "points": 10,
        },
      ],
    },
  },
  {
    "id": 6,
    "code": "PM-300",
    "title": "Project Management Fundamentals",
    "instructor": "Grace Kim",
    "category": "Business",
    "enrolled": False,
    "startDate": 1777593600000,
    "image": image6,
    "dogimage": dog6,
    "catimage": cat6,
    "birdimage": bird6,
    "bunnyimage": bunny6,
    "catnbunnyimage": bunny1,
    "lessons": [
      { "id": 1, "title": "Project Lifecycle", "points": 10, "completed": True, "completed_points": 5, "due": 1794639540000, "minigame": "minesweeper" },
      { "id": 2, "title": "Scope & Requirements", "points": 10, "completed": True, "completed_points": 7, "due": 1794898740000, "minigame": "minesweeper" },
      { "id": 3, "title": "Agile & Scrum", "points": 15, "completed": False, "completed_points": 0, "due": 1795157940000, "minigame": "minesweeper" },
      { "id": 4, "title": "Kanban", "points": 10, "completed": False, "completed_points": 0, "due": 1795503540000, "minigame": "snake" },
      { "id": 5, "title": "Risk Management", "points": 15, "completed": False, "completed_points": 0, "due": 1795762740000, "minigame": "snake" },
      { "id": 6, "title": "Stakeholder Communication", "points": 10, "completed": False, "completed_points": 0, "due": 1796021940000, "minigame": "snake" },
    ],
    "quiz": {
      "id": 60,
      "title": "PM-300 Project Management Quiz",
      "instructions": QUIZ_INSTRUCTIONS,
      "due": 1795762740000,
      "time_limit": 20,
      "completed_points": None,
      "questions": [
        {
          "q": "In Scrum, what is a time-boxed iteration called?",
          "options": ["Phase", "Sprint", "Milestone", "Epic"],
          "answer": 1,
          "points": 10,
        },
        {
          "q": "Who prioritizes the product backlog in Scrum?",
          "options": ["Scrum Master", "Development team", "Product Owner", "Stakeholders"],
          "answer": 2,
          "points": 10,
        },
        {
          "q": "Which is NOT one of the triple constraints?",
          "options": ["Scope", "Time", "Cost", "Morale"],
          "answer": 3,
          "points": 10,
        },
        {
          "q": "What does a Gantt chart show?",
          "options": ["Budget breakdown", "Tasks over time", "Team org structure", "Risk ratings"],
          "answer": 1,
          "points": 10,
        },
        {
          "q": "Which project lifecycle phase comes first?",
          "options": ["Execution", "Closing", "Initiation", "Monitoring"],
          "answer": 2,
          "points": 10,
        },
      ],
    },
  }
]

announcements = [
    "📢 System maintenance scheduled — check back later",
    "🎉 New courses added this month!",
    "⚠️ Reminder: complete your profile",
    "🔥 Limited-time: 3 new badges available",
    "📅 Office hours moved",
]
