// 4 users
const users = [
  { email: "mario@mail.com", password: "Password123!" },
  { email: "luigi@mail.com", password: "Password123!" },
  { email: "franki@mail.com", password: "Password123!" },
  { email: "willy@mail.com", password: "Password123!" },
  { email: "hogan@mail.com", password: "Password123!" },
  { email: "pamela@mail.com", password: "Password123!" },
  { email: "jonny@mail.com", password: "Password123!" },
  { email: "jenny@mail.com", password: "Password123!" },
  { email: "sue@mail.com", password: "Password123!" },
];

// 10 projects
const projects = [
  {
    title: "E-commerce Website Redesign",
    start: new Date(),
    end: new Date("2025-08-18"),
  },
  {
    title: "Mobile Expense Tracker App",
    start: new Date(),
    end: new Date("2025-09-11"),
  },
  {
    title: "AI-powered Chatbot Development",
    start: new Date(),
    end: new Date("2025-08-30"),
  },
  {
    title: "Green Energy Monitoring System",
    start: new Date(),
    end: new Date("2025-08-22"),
  },
  {
    title: "Community Outreach Program Platform",
    start: new Date(),
    end: new Date("2025-09-09"),
  },
  {
    title: "Virtual Reality Simulation Game",
    start: new Date(),
    end: new Date("2025-08-23"),
  },
  {
    title: "Machine Learning Algorithm for Image Recognition",
    start: new Date(),
    end: new Date("2025-08-15"),
  },
  {
    title: "Smart Home Automation System",
    start: new Date(),
    end: new Date("2025-08-27"),
  },
  {
    title: "Blockchain-based Supply Chain Solution",
    start: new Date(),
    end: new Date("2025-10-10"),
  },
  {
    title: "Health and Fitness Mobile App",
    start: new Date(),
    end: new Date("2025-09-21"),
  },
];

// 82 comments
const comments = [
  {
    content:
      "Refactor backend code to improve efficiency and scalability. Integrate third-party libraries for image processing. Implement caching mechanisms for frequent queries.",
  },
  {
    content:
      "Improve user experience with responsive design for mobile devices. Address cross-browser compatibility issues. Enhance animations based on feedback.",
  },
  {
    content:
      "Conduct code review to ensure quality and security. Write unit tests for login functionality. Implement error handling for form inputs.",
  },
  {
    content:
      "Deploy latest version to production server. Create documentation for API endpoints. Troubleshoot server connectivity issues.",
  },
  {
    content:
      "Enhance accessibility for users with disabilities. Refine user permissions management. Research best practices for scalability.",
  },
  {
    content:
      "Update user interface design. Optimize CSS for faster loading times. Improve performance of front-end rendering.",
  },
  {
    content:
      "Discuss project scope with stakeholders. Write technical blog post about project challenges. Address feedback from usability testing.",
  },
  {
    content:
      "Fix bug in authentication system. Implement new feature for data visualization. Optimize database queries for faster response times.",
  },
  {
    content:
      "Implement responsive design for mobile devices. Fix cross-browser compatibility issues. Update dependencies to latest versions.",
  },
  {
    content:
      "Refine user permissions management. Address security vulnerabilities in code. Write documentation for internal processes.",
  },
  {
    content:
      "Integrate continuous integration/continuous deployment pipeline. Conduct code review with development team. Improve performance of backend services.",
  },
  {
    content:
      "Troubleshoot server connectivity issues. Optimize database schema for scalability. Implement caching mechanism for frequent queries.",
  },
  {
    content:
      "Create user flow diagrams for new feature. Refactor frontend codebase for improved maintainability. Update project documentation.",
  },
  {
    content:
      "Improve accessibility for users with disabilities. Conduct usability testing on new features. Update user interface based on feedback.",
  },
  {
    content:
      "Research and implement best practices for security. Conduct security audit on existing codebase. Address identified security vulnerabilities.",
  },
  {
    content:
      "Write technical documentation for developers. Conduct training sessions on new technologies. Improve internal knowledge base.",
  },
  {
    content:
      "Optimize performance of database queries. Implement indexing strategy for faster data retrieval. Analyze and optimize database schema.",
  },
  {
    content:
      "Create roadmap for future development. Prioritize feature backlog based on stakeholder input. Coordinate with design team on UI/UX improvements.",
  },
  {
    content:
      "Implement authentication system using OAuth 2.0. Secure user data using encryption techniques. Implement multi-factor authentication.",
  },
  {
    content:
      "Optimize frontend assets for faster loading times. Minify CSS and JavaScript files. Leverage browser caching for static assets.",
  },
  {
    content:
      "Migrate to cloud-based infrastructure for scalability. Configure auto-scaling policies. Implement disaster recovery plan.",
  },
  {
    content:
      "Create detailed test plans for new features. Perform regression testing on existing functionality. Automate testing using CI/CD pipelines.",
  },
  {
    content:
      "Improve error logging and monitoring. Implement alerts for critical system issues. Analyze performance metrics and optimize as needed.",
  },
  {
    content:
      "Optimize memory usage in backend services. Identify and refactor memory leaks. Monitor resource usage and scale accordingly.",
  },
  {
    content:
      "Implement GraphQL API for improved data fetching. Optimize queries for efficient data retrieval. Migrate existing REST endpoints to GraphQL.",
  },
  {
    content:
      "Create user personas to guide feature development. Conduct user interviews to gather feedback. Iterate on designs based on user input.",
  },
  {
    content:
      "Implement search functionality with Elasticsearch. Index relevant data for fast and accurate search results. Facet search results for better user experience.",
  },
  {
    content:
      "Conduct performance testing on production environment. Identify and resolve bottlenecks. Scale infrastructure to handle increased load.",
  },
  {
    content:
      "Improve application logging for better troubleshooting. Implement log aggregation and analysis tools. Monitor logs for anomalies and errors.",
  },
  {
    content:
      "Implement role-based access control system. Define roles and permissions for different user types. Enforce access control at API level.",
  },
  {
    content:
      "Update user interface design based on user feedback. Implement new UI components for enhanced user experience. Conduct A/B testing for UI changes.",
  },
  {
    content:
      "Enhance data validation for improved security. Implement input sanitization to prevent SQL injection attacks. Validate user inputs on client and server sides.",
  },
  {
    content:
      "Optimize backend services for faster response times. Implement asynchronous processing for long-running tasks. Monitor and optimize resource usage.",
  },
  {
    content:
      "Implement pagination for large datasets. Improve user experience with lazy loading of data. Optimize backend queries for efficient data retrieval.",
  },
  {
    content:
      "Create automated deployment scripts for streamlined deployment process. Implement blue-green deployment strategy for zero downtime deployments.",
  },
  {
    content:
      "Conduct load testing to ensure application scalability. Identify performance bottlenecks under high load. Optimize infrastructure to handle increased traffic.",
  },
  {
    content:
      "Improve error handling to provide better user feedback. Log detailed error messages for debugging purposes. Implement retry mechanisms for transient errors.",
  },
  {
    content:
      "Implement session management for user authentication. Store session data securely and invalidate sessions after logout or timeout. Implement CSRF protection.",
  },
  {
    content:
      "Optimize database indexes for faster query execution. Monitor database performance and optimize queries based on usage patterns. Analyze slow query logs for optimizations.",
  },
  {
    content:
      "Improve application logging for better troubleshooting. Implement structured logging for easier analysis. Centralize logs for easier monitoring and analysis.",
  },
  {
    content:
      "Implement content caching for faster page loads. Cache frequently accessed data to reduce database load. Invalidate cache when data is updated.",
  },
  {
    content:
      "Improve application security with regular vulnerability assessments. Patch security vulnerabilities promptly. Educate development team on secure coding practices.",
  },
  {
    content:
      "Optimize network requests for improved performance. Minimize latency by reducing round trips. Implement caching mechanisms for frequently accessed resources.",
  },
  {
    content:
      "Implement data migration tool for seamless database upgrades. Validate data integrity during migration process. Rollback changes in case of errors.",
  },
  {
    content:
      "Improve error handling to provide better user feedback. Log detailed error messages for debugging purposes. Implement retry mechanisms for transient errors.",
  },
  {
    content:
      "Implement session management for user authentication. Store session data securely and invalidate sessions after logout or timeout. Implement CSRF protection.",
  },
  {
    content:
      "Optimize database indexes for faster query execution. Monitor database performance and optimize queries based on usage patterns. Analyze slow query logs for optimizations.",
  },
  {
    content:
      "Improve application logging for better troubleshooting. Implement structured logging for easier analysis. Centralize logs for easier monitoring and analysis.",
  },
  {
    content:
      "Implement content caching for faster page loads. Cache frequently accessed data to reduce database load. Invalidate cache when data is updated.",
  },
  {
    content:
      "Improve application security with regular vulnerability assessments. Patch security vulnerabilities promptly. Educate development team on secure coding practices.",
  },
  {
    content:
      "Implement data migration tool for seamless database upgrades. Validate data integrity during migration process. Rollback changes in case of errors.",
  },
  {
    content:
      "Improve error handling to provide better user feedback. Log detailed error messages for debugging purposes. Implement retry mechanisms for transient errors.",
  },
  {
    content:
      "Implement session management for user authentication. Store session data securely and invalidate sessions after logout or timeout. Implement CSRF protection.",
  },
  {
    content:
      "Optimize database indexes for faster query execution. Monitor database performance and optimize queries based on usage patterns. Analyze slow query logs for optimizations.",
  },
  {
    content:
      "Improve application logging for better troubleshooting. Implement structured logging for easier analysis. Centralize logs for easier monitoring and analysis.",
  },
  {
    content:
      "Implement content caching for faster page loads. Cache frequently accessed data to reduce database load. Invalidate cache when data is updated.",
  },
  {
    content:
      "Improve application security with regular vulnerability assessments. Patch security vulnerabilities promptly. Educate development team on secure coding practices.",
  },
  {
    content:
      "Optimize network requests for improved performance. Minimize latency by reducing round trips. Implement caching mechanisms for frequently accessed resources.",
  },
  {
    content:
      "Implement data migration tool for seamless database upgrades. Validate data integrity during migration process. Rollback changes in case of errors.",
  },
  {
    content:
      "Improve error handling to provide better user feedback. Log detailed error messages for debugging purposes. Implement retry mechanisms for transient errors.",
  },
  {
    content:
      "Implement session management for user authentication. Store session data securely and invalidate sessions after logout or timeout. Implement CSRF protection.",
  },
  {
    content:
      "Optimize database indexes for faster query execution. Monitor database performance and optimize queries based on usage patterns. Analyze slow query logs for optimizations.",
  },
  {
    content:
      "Improve application logging for better troubleshooting. Implement structured logging for easier analysis. Centralize logs for easier monitoring and analysis.",
  },
  {
    content:
      "Implement content caching for faster page loads. Cache frequently accessed data to reduce database load. Invalidate cache when data is updated.",
  },
  {
    content:
      "Improve application security with regular vulnerability assessments. Patch security vulnerabilities promptly. Educate development team on secure coding practices.",
  },
  {
    content:
      "Optimize network requests for improved performance. Minimize latency by reducing round trips. Implement caching mechanisms for frequently accessed resources.",
  },
  {
    content:
      "Implement data migration tool for seamless database upgrades. Validate data integrity during migration process. Rollback changes in case of errors.",
  },
  {
    content:
      "Improve error handling to provide better user feedback. Log detailed error messages for debugging purposes. Implement retry mechanisms for transient errors.",
  },
  {
    content:
      "Implement session management for user authentication. Store session data securely and invalidate sessions after logout or timeout. Implement CSRF protection.",
  },
  {
    content:
      "Optimize database indexes for faster query execution. Monitor database performance and optimize queries based on usage patterns. Analyze slow query logs for optimizations.",
  },
  {
    content:
      "Improve application logging for better troubleshooting. Implement structured logging for easier analysis. Centralize logs for easier monitoring and analysis.",
  },
  {
    content:
      "Implement content caching for faster page loads. Cache frequently accessed data to reduce database load. Invalidate cache when data is updated.",
  },
  {
    content:
      "Improve application security with regular vulnerability assessments. Patch security vulnerabilities promptly. Educate development team on secure coding practices.",
  },
  {
    content:
      "Optimize network requests for improved performance. Minimize latency by reducing round trips. Implement caching mechanisms for frequently accessed resources.",
  },
  {
    content:
      "Implement data migration tool for seamless database upgrades. Validate data integrity during migration process. Rollback changes in case of errors.",
  },
  {
    content:
      "Improve error handling to provide better user feedback. Log detailed error messages for debugging purposes. Implement retry mechanisms for transient errors.",
  },
  {
    content:
      "Implement session management for user authentication. Store session data securely and invalidate sessions after logout or timeout. Implement CSRF protection.",
  },
  {
    content:
      "Optimize database indexes for faster query execution. Monitor database performance and optimize queries based on usage patterns. Analyze slow query logs for optimizations.",
  },
  {
    content:
      "Improve application logging for better troubleshooting. Implement structured logging for easier analysis. Centralize logs for easier monitoring and analysis.",
  },
  {
    content:
      "Implement content caching for faster page loads. Cache frequently accessed data to reduce database load. Invalidate cache when data is updated.",
  },
  {
    content:
      "Improve application security with regular vulnerability assessments. Patch security vulnerabilities promptly. Educate development team on secure coding practices.",
  },
  {
    content:
      "Optimize network requests for improved performance. Minimize latency by reducing round trips. Implement caching mechanisms for frequently accessed resources.",
  },
];

// 73 tasks
const tasks = [
  {
    title: "Quarterly Financial Analysis",
    description:
      "Analyze financial data, including revenue, expenses, and profitability, to prepare a comprehensive quarterly report for stakeholders. This analysis will involve examining trends, identifying key drivers of financial performance, and providing insights to guide strategic decision-making. The report will be crucial for assessing the company's financial health and determining areas for improvement or investment.",
    deadline: new Date("2024-11-12"),
  },
  {
    title: "Website Redesign Strategy Meeting",
    description:
      "Host a strategy meeting to discuss and plan the upcoming website redesign project. This meeting will involve brainstorming ideas, setting objectives, and assigning tasks to team members. Key topics of discussion will include user experience enhancements, visual design elements, and technical requirements. The goal is to create a roadmap for a successful website redesign that aligns with the company's goals and objectives.",
    deadline: new Date("2024-07-28"),
  },
  {
    title: "Marketing Campaign Launch",
    description:
      "Execute a comprehensive marketing campaign to promote the launch of a new product. This campaign will include various promotional activities such as social media advertising, email marketing, and influencer partnerships. The goal is to create buzz and generate excitement around the new product, ultimately driving sales and increasing market share. The campaign will be meticulously planned and executed to ensure maximum impact and reach.",
    deadline: new Date("2024-10-05"),
  },
  {
    title: "Employee Training Program Development",
    description:
      "Develop a robust training program for new hires to ensure they are equipped with the necessary skills and knowledge to excel in their roles. This program will cover various topics such as company policies and procedures, job-specific training, and professional development opportunities. The goal is to onboard new employees effectively and efficiently, ultimately contributing to employee satisfaction and retention.",
    deadline: new Date("2025-03-20"),
  },
  {
    title: "Customer Feedback Analysis",
    description:
      "Analyze customer feedback to gain insights into their needs, preferences, and pain points. This analysis will involve categorizing feedback, identifying trends, and prioritizing areas for improvement. The goal is to enhance the customer experience and drive customer satisfaction and loyalty. Insights from the analysis will inform decision-making across various departments, including product development, marketing, and customer support.",
    deadline: new Date("2025-01-18"),
  },
  {
    title: "Budget Planning Meeting",
    description:
      "Conduct a budget planning meeting to review current financial performance and plan for the next fiscal year. This meeting will involve analyzing revenue projections, identifying expenses, and setting budgetary goals. Key areas of discussion will include resource allocation, cost-saving initiatives, and investment opportunities. The goal is to create a balanced budget that supports the company's strategic objectives while ensuring financial stability.",
    deadline: new Date("2024-09-03"),
  },
  {
    title: "Software Update Testing",
    description:
      "Conduct comprehensive testing of a new software update to ensure it meets quality standards and functions as intended. This testing will involve various techniques such as functional testing, regression testing, and performance testing. The goal is to identify and fix any bugs or issues before the update is rolled out to users. Testing will be conducted rigorously to minimize disruptions and ensure a smooth user experience.",
    deadline: new Date("2025-06-11"),
  },
  {
    title: "Team Building Retreat",
    description:
      "Organize a team building retreat to foster stronger bonds and improve collaboration among team members. This retreat will include various activities such as team-building exercises, workshops, and outdoor adventures. The goal is to create a supportive and cohesive team culture that enhances productivity and morale. The retreat will be carefully planned to accommodate the needs and preferences of all team members.",
    deadline: new Date("2024-08-15"),
  },
  {
    title: "Client Proposal Presentation",
    description:
      "Prepare and deliver a compelling proposal presentation to a potential client. This presentation will outline the company's capabilities, proposed solutions, and value proposition. Key topics of discussion will include project scope, deliverables, and pricing. The goal is to persuade the client to choose our company for their project or business needs. The presentation will be tailored to address the client's specific requirements and preferences.",
    deadline: new Date("2024-12-30"),
  },
  {
    title: "Project Status Update",
    description:
      "Provide a comprehensive status update on an ongoing project to stakeholders and team members. This update will include progress achieved, milestones reached, and any challenges or obstacles encountered. Key topics of discussion will include project timeline, budget, and resource allocation. The goal is to keep stakeholders informed and engaged, ensuring alignment and accountability across the project team.",
    deadline: new Date("2025-05-22"),
  },
  {
    title: "Market Research Survey Analysis",
    description:
      "Analyze data from market research surveys to gain insights into consumer behavior, preferences, and trends. This analysis will involve identifying patterns, correlations, and outliers in the data. Key areas of focus will include demographic information, purchase behavior, and brand perception. The goal is to inform marketing strategies, product development decisions, and overall business strategy.",
    deadline: new Date("2024-08-28"),
  },
  {
    title: "Content Creation Workshop",
    description:
      "Host a content creation workshop to brainstorm ideas and develop engaging content for marketing campaigns. This workshop will include exercises and activities to spark creativity and generate innovative content concepts. Key topics of discussion will include storytelling techniques, content formats, and distribution channels. The goal is to create compelling content that resonates with the target audience and drives engagement and conversions.",
    deadline: new Date("2025-02-14"),
  },
  {
    title: "Product Demo Preparation",
    description:
      "Prepare materials and rehearse for an upcoming product demo to showcase features, benefits, and use cases. This preparation will involve creating presentation slides, scripting demos, and coordinating logistics. Key areas of focus will include product messaging, competitive differentiation, and audience engagement strategies. The goal is to deliver a polished and impactful demo that generates interest and excitement among prospects and stakeholders.",
    deadline: new Date("2025-06-06"),
  },
  {
    title: "Financial Audit",
    description:
      "Conduct a thorough audit of the company's financial statements, records, and processes to ensure accuracy and compliance with regulations. This audit will involve examining financial transactions, verifying balances, and assessing internal controls. Key areas of focus will include revenue recognition, expense management, and asset valuation. The goal is to provide assurance to stakeholders and identify opportunities for improvement in financial management.",
    deadline: new Date("2024-09-10"),
  },
  {
    title: "Quarterly Financial Analysis",
    description:
      "Analyze financial data, including revenue, expenses, and profitability, to prepare a comprehensive quarterly report for stakeholders. This analysis will involve examining trends, identifying key drivers of financial performance, and providing insights to guide strategic decision-making. The report will be crucial for assessing the company's financial health and determining areas for improvement or investment.",
    deadline: new Date("2024-11-12"),
  },
  {
    title: "Website Redesign Strategy Meeting",
    description:
      "Host a strategy meeting to discuss and plan the upcoming website redesign project. This meeting will involve brainstorming ideas, setting objectives, and assigning tasks to team members. Key topics of discussion will include user experience enhancements, visual design elements, and technical requirements. The goal is to create a roadmap for a successful website redesign that aligns with the company's goals and objectives.",
    deadline: new Date("2024-07-28"),
  },
  {
    title: "Marketing Campaign Launch",
    description:
      "Execute a comprehensive marketing campaign to promote the launch of a new product. This campaign will include various promotional activities such as social media advertising, email marketing, and influencer partnerships. The goal is to create buzz and generate excitement around the new product, ultimately driving sales and increasing market share. The campaign will be meticulously planned and executed to ensure maximum impact and reach.",
    deadline: new Date("2024-10-05"),
  },
  {
    title: "Employee Training Program Development",
    description:
      "Develop a robust training program for new hires to ensure they are equipped with the necessary skills and knowledge to excel in their roles. This program will cover various topics such as company policies and procedures, job-specific training, and professional development opportunities. The goal is to onboard new employees effectively and efficiently, ultimately contributing to employee satisfaction and retention.",
    deadline: new Date("2025-03-20"),
  },
  {
    title: "Customer Feedback Analysis",
    description:
      "Analyze customer feedback to gain insights into their needs, preferences, and pain points. This analysis will involve categorizing feedback, identifying trends, and prioritizing areas for improvement. The goal is to enhance the customer experience and drive customer satisfaction and loyalty. Insights from the analysis will inform decision-making across various departments, including product development, marketing, and customer support.",
    deadline: new Date("2025-01-18"),
  },
  {
    title: "Budget Planning Meeting",
    description:
      "Conduct a budget planning meeting to review current financial performance and plan for the next fiscal year. This meeting will involve analyzing revenue projections, identifying expenses, and setting budgetary goals. Key areas of discussion will include resource allocation, cost-saving initiatives, and investment opportunities. The goal is to create a balanced budget that supports the company's strategic objectives while ensuring financial stability.",
    deadline: new Date("2024-09-03"),
  },
  {
    title: "Software Update Testing",
    description:
      "Conduct comprehensive testing of a new software update to ensure it meets quality standards and functions as intended. This testing will involve various techniques such as functional testing, regression testing, and performance testing. The goal is to identify and fix any bugs or issues before the update is rolled out to users. Testing will be conducted rigorously to minimize disruptions and ensure a smooth user experience.",
    deadline: new Date("2025-06-11"),
  },
  {
    title: "Team Building Retreat",
    description:
      "Organize a team building retreat to foster stronger bonds and improve collaboration among team members. This retreat will include various activities such as team-building exercises, workshops, and outdoor adventures. The goal is to create a supportive and cohesive team culture that enhances productivity and morale. The retreat will be carefully planned to accommodate the needs and preferences of all team members.",
    deadline: new Date("2024-08-15"),
  },
  {
    title: "Client Proposal Presentation",
    description:
      "Prepare and deliver a compelling proposal presentation to a potential client. This presentation will outline the company's capabilities, proposed solutions, and value proposition. Key topics of discussion will include project scope, deliverables, and pricing. The goal is to persuade the client to choose our company for their project or business needs. The presentation will be tailored to address the client's specific requirements and preferences.",
    deadline: new Date("2024-12-30"),
  },
  {
    title: "Project Status Update",
    description:
      "Provide a comprehensive status update on an ongoing project to stakeholders and team members. This update will include progress achieved, milestones reached, and any challenges or obstacles encountered. Key topics of discussion will include project timeline, budget, and resource allocation. The goal is to keep stakeholders informed and engaged, ensuring alignment and accountability across the project team.",
    deadline: new Date("2025-05-22"),
  },
  {
    title: "Market Research Survey Analysis",
    description:
      "Analyze data from market research surveys to gain insights into consumer behavior, preferences, and trends. This analysis will involve identifying patterns, correlations, and outliers in the data. Key areas of focus will include demographic information, purchase behavior, and brand perception. The goal is to inform marketing strategies, product development decisions, and overall business strategy.",
    deadline: new Date("2024-08-28"),
  },
  {
    title: "Content Creation Workshop",
    description:
      "Host a content creation workshop to brainstorm ideas and develop engaging content for marketing campaigns. This workshop will include exercises and activities to spark creativity and generate innovative content concepts. Key topics of discussion will include storytelling techniques, content formats, and distribution channels. The goal is to create compelling content that resonates with the target audience and drives engagement and conversions.",
    deadline: new Date("2025-02-14"),
  },
  {
    title: "Product Demo Preparation",
    description:
      "Prepare materials and rehearse for an upcoming product demo to showcase features, benefits, and use cases. This preparation will involve creating presentation slides, scripting demos, and coordinating logistics. Key areas of focus will include product messaging, competitive differentiation, and audience engagement strategies. The goal is to deliver a polished and impactful demo that generates interest and excitement among prospects and stakeholders.",
    deadline: new Date("2025-06-06"),
  },
  {
    title: "Financial Audit",
    description:
      "Conduct a thorough audit of the company's financial statements, records, and processes to ensure accuracy and compliance with regulations. This audit will involve examining financial transactions, verifying balances, and assessing internal controls. Key areas of focus will include revenue recognition, expense management, and asset valuation. The goal is to provide assurance to stakeholders and identify opportunities for improvement in financial management.",
    deadline: new Date("2024-09-10"),
  },
  {
    title: "Customer Support Training Session",
    description:
      "Organize a training session for customer support representatives to enhance their skills and knowledge. This session will cover topics such as effective communication, problem-solving techniques, and product knowledge. Key areas of focus will include empathy, active listening, and conflict resolution. The goal is to equip support representatives with the tools and techniques they need to deliver exceptional customer service and resolve issues efficiently.",
    deadline: new Date("2025-01-25"),
  },
  {
    title: "Market Expansion Strategy Planning",
    description:
      "Develop a comprehensive strategy to expand market reach and increase customer base. This strategy will involve identifying target markets, evaluating market entry options, and developing marketing and distribution plans. Key considerations will include competitive analysis, regulatory requirements, and cultural nuances. The goal is to drive sustainable growth and capture market opportunities.",
    deadline: new Date("2025-04-05"),
  },
  {
    title: "Employee Performance Evaluation",
    description:
      "Conduct performance evaluations for all employees to assess their performance against set objectives and expectations. This evaluation will involve reviewing job performance, providing feedback, and setting goals for improvement. Key areas of focus will include productivity, teamwork, and adherence to company values. The goal is to recognize and reward high performers and identify areas for development.",
    deadline: new Date("2024-12-15"),
  },
  {
    title: "Product Launch Event Coordination",
    description:
      "Coordinate all aspects of a product launch event, including venue selection, invitation management, and onsite logistics. This coordination will involve working closely with vendors, sponsors, and internal stakeholders to ensure a seamless event experience. Key elements of the event will include product demonstrations, keynote presentations, and networking opportunities. The goal is to generate excitement and media coverage for the new product.",
    deadline: new Date("2025-06-30"),
  },
  {
    title: "IT Infrastructure Upgrade",
    description:
      "Plan and execute a comprehensive upgrade of the company's IT infrastructure to improve performance, reliability, and security. This upgrade will involve assessing current infrastructure, identifying areas for improvement, and implementing new technologies and systems. Key components of the upgrade will include hardware upgrades, software updates, and cybersecurity enhancements. The goal is to modernize the IT environment to support business growth and innovation.",
    deadline: new Date("2024-10-25"),
  },
  {
    title: "Training Program Evaluation",
    description:
      "Evaluate the effectiveness of training programs to assess their impact on employee performance and organizational goals. This evaluation will involve gathering feedback from participants, analyzing training outcomes, and identifying areas for improvement. Key metrics will include knowledge acquisition, skill development, and behavior change. The goal is to ensure that training programs are aligned with business objectives and contribute to employee development.",
    deadline: new Date("2025-01-20"),
  },
  {
    title: "Market Analysis Report",
    description:
      "Prepare a comprehensive report on current market trends, competitive landscape, and growth opportunities. This report will involve analyzing industry data, conducting market research, and synthesizing findings into actionable insights. Key sections of the report will include market size and segmentation, competitor analysis, and SWOT analysis. The goal is to provide strategic guidance for decision-making and business planning.",
    deadline: new Date("2025-04-15"),
  },
  {
    title: "Customer Feedback Implementation",
    description:
      "Implement changes based on customer feedback to enhance product features, services, and overall customer experience. This implementation will involve prioritizing feedback, developing action plans, and coordinating cross-functional teams. Key areas of focus will include product improvements, process changes, and service enhancements. The goal is to address customer needs and preferences proactively to drive satisfaction and loyalty.",
    deadline: new Date("2024-12-20"),
  },
  {
    title: "Employee Recognition Program Development",
    description:
      "Develop a comprehensive employee recognition program to acknowledge and reward outstanding performance and contributions. This program will involve defining recognition criteria, designing rewards and incentives, and implementing recognition initiatives. Key elements of the program will include peer-to-peer recognition, manager recognition, and formal awards ceremonies. The goal is to foster a culture of appreciation and engagement.",
    deadline: new Date("2025-07-15"),
  },
  {
    title: "Budget Allocation Review",
    description:
      "Conduct a review of budget allocations to ensure alignment with strategic priorities and financial objectives. This review will involve analyzing spending patterns, identifying cost-saving opportunities, and reallocating funds as needed. Key areas of focus will include capital expenditures, operating expenses, and investment priorities. The goal is to optimize budget allocations to support business growth and value creation.",
    deadline: new Date("2024-09-30"),
  },
  {
    title: "Market Research Survey Design",
    description:
      "Design and launch a market research survey to gather data on customer preferences, buying behavior, and brand perception. This survey will involve developing survey questions, selecting survey methods, and targeting relevant audiences. Key considerations will include survey length, question wording, and response options. The goal is to collect actionable insights to inform marketing strategies and business decisions.",
    deadline: new Date("2025-02-05"),
  },
  {
    title: "Content Marketing Campaign Launch",
    description:
      "Launch a content marketing campaign to increase brand awareness, engage target audiences, and drive traffic and leads. This campaign will involve creating and distributing valuable, relevant content across various channels, such as blog posts, videos, infographics, and social media. Key elements of the campaign will include content planning, creation, distribution, and measurement. The goal is to attract and retain customers by providing valuable content that addresses their needs and interests.",
    deadline: new Date("2025-05-05"),
  },
  {
    title: "Project Risk Assessment",
    description:
      "Conduct a thorough assessment of project risks to identify potential threats and opportunities that may impact project success. This assessment will involve analyzing project objectives, stakeholders, constraints, and external factors to identify and prioritize risks. Key steps will include risk identification, analysis, evaluation, and response planning. The goal is to proactively manage risks to minimize their impact on project objectives and outcomes.",
    deadline: new Date("2024-07-31"),
  },
  {
    title: "Customer Support Process Optimization",
    description:
      "Optimize customer support processes and workflows to improve efficiency, responsiveness, and customer satisfaction. This optimization effort will involve reviewing current processes, identifying bottlenecks and pain points, and implementing improvements and automation where possible. Key areas of focus will include ticket management, response times, knowledge management, and customer feedback loops. The goal is to streamline support operations and enhance the overall customer experience.",
    deadline: new Date("2025-03-28"),
  },
  {
    title: "Sales Training Workshop",
    description:
      "Organize and conduct a sales training workshop to equip sales teams with the skills, knowledge, and tools they need to succeed. This workshop will cover a range of topics, including sales techniques, product knowledge, objection handling, and customer relationship management. Key elements will include interactive sessions, role-playing exercises, and case studies. The goal is to empower sales teams to build stronger relationships with customers, overcome objections, and close more deals.",
    deadline: new Date("2025-06-15"),
  },
  {
    title: "IT Security Audit",
    description:
      "Conduct a comprehensive audit of IT systems, infrastructure, and policies to identify security vulnerabilities and risks. This audit will involve reviewing access controls, network configurations, data protection measures, and compliance with security standards and regulations. Key areas of focus will include threat detection, incident response, and employee security awareness training. The goal is to strengthen the organization's overall security posture and protect against cyber threats.",
    deadline: new Date("2024-10-20"),
  },
  {
    title: "Employee Engagement Survey Analysis",
    description:
      "Analyze the results of an employee engagement survey to assess employee satisfaction, morale, and retention. This analysis will involve aggregating survey responses, identifying trends and patterns, and benchmarking results against industry standards. Key areas of focus will include job satisfaction, organizational culture, leadership effectiveness, and opportunities for improvement. The goal is to understand employee sentiment and implement initiatives to enhance engagement and productivity.",
    deadline: new Date("2025-01-12"),
  },
  {
    title: "Market Penetration Strategy Planning",
    description:
      "Develop a strategic plan to penetrate new markets and expand market share. This plan will involve identifying target markets, segmenting customers, and developing market entry strategies. Key considerations will include competitive analysis, pricing strategies, distribution channels, and promotional tactics. The goal is to establish a foothold in new markets and gain market share from competitors.",
    deadline: new Date("2025-04-02"),
  },
  {
    title: "Product Feedback Collection",
    description:
      "Collect feedback from customers on product features, performance, and user experience. This feedback collection effort will involve gathering input through surveys, interviews, user testing, and online reviews. Key areas of focus will include product usability, functionality, reliability, and value proposition. The goal is to gather actionable insights to inform product improvements and enhancements.",
    deadline: new Date("2024-11-28"),
  },
  {
    title: "Employee Onboarding Program",
    description:
      "Develop and implement an employee onboarding program to ensure new hires are successfully integrated into the organization and equipped to contribute effectively. This program will cover various aspects of onboarding, including company orientation, job training, and cultural immersion. Key elements will include welcome kits, training modules, mentorship programs, and check-in meetings. The goal is to accelerate new hire productivity, engagement, and retention.",
    deadline: new Date("2025-02-28"),
  },
  {
    title: "Product Launch Marketing Plan",
    description:
      "Develop a comprehensive marketing plan to support the launch of a new product. This plan will outline marketing objectives, target audience profiles, messaging strategies, and promotional tactics. Key elements will include digital marketing campaigns, public relations efforts, social media strategies, and event marketing initiatives. The goal is to generate awareness, interest, and demand for the new product.",
    deadline: new Date("2025-05-17"),
  },
  {
    title: "Market Expansion Strategy Planning",
    description:
      "Develop a comprehensive strategy to expand market reach and increase customer base. This strategy will involve identifying target markets, evaluating market entry options, and developing marketing and distribution plans. Key considerations will include competitive analysis, regulatory requirements, and cultural nuances. The goal is to drive sustainable growth and capture market opportunities.",
    deadline: new Date("2025-04-05"),
  },
  {
    title: "Employee Performance Evaluation",
    description:
      "Conduct performance evaluations for all employees to assess their performance against set objectives and expectations. This evaluation will involve reviewing job performance, providing feedback, and setting goals for improvement. Key areas of focus will include productivity, teamwork, and adherence to company values. The goal is to recognize and reward high performers and identify areas for development.",
    deadline: new Date("2024-12-15"),
  },
  {
    title: "Product Launch Event Coordination",
    description:
      "Coordinate all aspects of a product launch event, including venue selection, invitation management, and onsite logistics. This coordination will involve working closely with vendors, sponsors, and internal stakeholders to ensure a seamless event experience. Key elements of the event will include product demonstrations, keynote presentations, and networking opportunities. The goal is to generate excitement and media coverage for the new product.",
    deadline: new Date("2025-06-30"),
  },
  {
    title: "IT Infrastructure Upgrade",
    description:
      "Plan and execute a comprehensive upgrade of the company's IT infrastructure to improve performance, reliability, and security. This upgrade will involve assessing current infrastructure, identifying areas for improvement, and implementing new technologies and systems. Key components of the upgrade will include hardware upgrades, software updates, and cybersecurity enhancements. The goal is to modernize the IT environment to support business growth and innovation.",
    deadline: new Date("2024-10-25"),
  },
  {
    title: "Training Program Evaluation",
    description:
      "Evaluate the effectiveness of training programs to assess their impact on employee performance and organizational goals. This evaluation will involve gathering feedback from participants, analyzing training outcomes, and identifying areas for improvement. Key metrics will include knowledge acquisition, skill development, and behavior change. The goal is to ensure that training programs are aligned with business objectives and contribute to employee development.",
    deadline: new Date("2025-01-20"),
  },
  {
    title: "Market Analysis Report",
    description:
      "Prepare a comprehensive report on current market trends, competitive landscape, and growth opportunities. This report will involve analyzing industry data, conducting market research, and synthesizing findings into actionable insights. Key sections of the report will include market size and segmentation, competitor analysis, and SWOT analysis. The goal is to provide strategic guidance for decision-making and business planning.",
    deadline: new Date("2025-04-15"),
  },
  {
    title: "Customer Feedback Implementation",
    description:
      "Implement changes based on customer feedback to enhance product features, services, and overall customer experience. This implementation will involve prioritizing feedback, developing action plans, and coordinating cross-functional teams. Key areas of focus will include product improvements, process changes, and service enhancements. The goal is to address customer needs and preferences proactively to drive satisfaction and loyalty.",
    deadline: new Date("2024-12-20"),
  },
  {
    title: "Employee Recognition Program Development",
    description:
      "Develop a comprehensive employee recognition program to acknowledge and reward outstanding performance and contributions. This program will involve defining recognition criteria, designing rewards and incentives, and implementing recognition initiatives. Key elements of the program will include peer-to-peer recognition, manager recognition, and formal awards ceremonies. The goal is to foster a culture of appreciation and engagement.",
    deadline: new Date("2025-07-15"),
  },
  {
    title: "Budget Allocation Review",
    description:
      "Conduct a review of budget allocations to ensure alignment with strategic priorities and financial objectives. This review will involve analyzing spending patterns, identifying cost-saving opportunities, and reallocating funds as needed. Key areas of focus will include capital expenditures, operating expenses, and investment priorities. The goal is to optimize budget allocations to support business growth and value creation.",
    deadline: new Date("2024-09-30"),
  },
  {
    title: "Market Research Survey Design",
    description:
      "Design and launch a market research survey to gather data on customer preferences, buying behavior, and brand perception. This survey will involve developing survey questions, selecting survey methods, and targeting relevant audiences. Key considerations will include survey length, question wording, and response options. The goal is to collect actionable insights to inform marketing strategies and business decisions.",
    deadline: new Date("2025-02-05"),
  },
  {
    title: "Market Expansion Strategy Planning",
    description:
      "Develop a comprehensive strategy to expand market reach and increase customer base. This strategy will involve identifying target markets, evaluating market entry options, and developing marketing and distribution plans. Key considerations will include competitive analysis, regulatory requirements, and cultural nuances. The goal is to drive sustainable growth and capture market opportunities.",
    deadline: new Date("2025-04-05"),
  },
  {
    title: "Employee Performance Evaluation",
    description:
      "Conduct performance evaluations for all employees to assess their performance against set objectives and expectations. This evaluation will involve reviewing job performance, providing feedback, and setting goals for improvement. Key areas of focus will include productivity, teamwork, and adherence to company values. The goal is to recognize and reward high performers and identify areas for development.",
    deadline: new Date("2024-12-15"),
  },
  {
    title: "Product Launch Event Coordination",
    description:
      "Coordinate all aspects of a product launch event, including venue selection, invitation management, and onsite logistics. This coordination will involve working closely with vendors, sponsors, and internal stakeholders to ensure a seamless event experience. Key elements of the event will include product demonstrations, keynote presentations, and networking opportunities. The goal is to generate excitement and media coverage for the new product.",
    deadline: new Date("2025-06-30"),
  },
  {
    title: "IT Infrastructure Upgrade",
    description:
      "Plan and execute a comprehensive upgrade of the company's IT infrastructure to improve performance, reliability, and security. This upgrade will involve assessing current infrastructure, identifying areas for improvement, and implementing new technologies and systems. Key components of the upgrade will include hardware upgrades, software updates, and cybersecurity enhancements. The goal is to modernize the IT environment to support business growth and innovation.",
    deadline: new Date("2024-10-25"),
  },
  {
    title: "Training Program Evaluation",
    description:
      "Evaluate the effectiveness of training programs to assess their impact on employee performance and organizational goals. This evaluation will involve gathering feedback from participants, analyzing training outcomes, and identifying areas for improvement. Key metrics will include knowledge acquisition, skill development, and behavior change. The goal is to ensure that training programs are aligned with business objectives and contribute to employee development.",
    deadline: new Date("2025-01-20"),
  },
  {
    title: "Market Analysis Report",
    description:
      "Prepare a comprehensive report on current market trends, competitive landscape, and growth opportunities. This report will involve analyzing industry data, conducting market research, and synthesizing findings into actionable insights. Key sections of the report will include market size and segmentation, competitor analysis, and SWOT analysis. The goal is to provide strategic guidance for decision-making and business planning.",
    deadline: new Date("2025-04-15"),
  },
  {
    title: "Customer Feedback Implementation",
    description:
      "Implement changes based on customer feedback to enhance product features, services, and overall customer experience. This implementation will involve prioritizing feedback, developing action plans, and coordinating cross-functional teams. Key areas of focus will include product improvements, process changes, and service enhancements. The goal is to address customer needs and preferences proactively to drive satisfaction and loyalty.",
    deadline: new Date("2024-12-20"),
  },
  {
    title: "Employee Recognition Program Development",
    description:
      "Develop a comprehensive employee recognition program to acknowledge and reward outstanding performance and contributions. This program will involve defining recognition criteria, designing rewards and incentives, and implementing recognition initiatives. Key elements of the program will include peer-to-peer recognition, manager recognition, and formal awards ceremonies. The goal is to foster a culture of appreciation and engagement.",
    deadline: new Date("2025-07-15"),
  },
  {
    title: "Budget Allocation Review",
    description:
      "Conduct a review of budget allocations to ensure alignment with strategic priorities and financial objectives. This review will involve analyzing spending patterns, identifying cost-saving opportunities, and reallocating funds as needed. Key areas of focus will include capital expenditures, operating expenses, and investment priorities. The goal is to optimize budget allocations to support business growth and value creation.",
    deadline: new Date("2024-09-30"),
  },
  {
    title: "Market Research Survey Design",
    description:
      "Design and launch a market research survey to gather data on customer preferences, buying behavior, and brand perception. This survey will involve developing survey questions, selecting survey methods, and targeting relevant audiences. Key considerations will include survey length, question wording, and response options. The goal is to collect actionable insights to inform marketing strategies and business decisions.",
    deadline: new Date("2025-02-05"),
  },
  {
    title: "Content Marketing Campaign Launch",
    description:
      "Launch a content marketing campaign to increase brand awareness, engage target audiences, and drive traffic and leads. This campaign will involve creating and distributing valuable, relevant content across various channels, such as blog posts, videos, infographics, and social media. Key elements of the campaign will include content planning, creation, distribution, and measurement. The goal is to attract and retain customers by providing valuable content that addresses their needs and interests.",
    deadline: new Date("2025-05-05"),
  },
  {
    title: "Project Risk Assessment",
    description:
      "Conduct a thorough assessment of project risks to identify potential threats and opportunities that may impact project success. This assessment will involve analyzing project objectives, stakeholders, constraints, and external factors to identify and prioritize risks. Key steps will include risk identification, analysis, evaluation, and response planning. The goal is to proactively manage risks to minimize their impact on project objectives and outcomes.",
    deadline: new Date("2024-07-31"),
  },
  {
    title: "Customer Support Process Optimization",
    description:
      "Optimize customer support processes and workflows to improve efficiency, responsiveness, and customer satisfaction. This optimization effort will involve reviewing current processes, identifying bottlenecks and pain points, and implementing improvements and automation where possible. Key areas of focus will include ticket management, response times, knowledge management, and customer feedback loops. The goal is to streamline support operations and enhance the overall customer experience.",
    deadline: new Date("2025-03-28"),
  },
  {
    title: "Sales Training Workshop",
    description:
      "Organize and conduct a sales training workshop to equip sales teams with the skills, knowledge, and tools they need to succeed. This workshop will cover a range of topics, including sales techniques, product knowledge, objection handling, and customer relationship management. Key elements will include interactive sessions, role-playing exercises, and case studies. The goal is to empower sales teams to build stronger relationships with customers, overcome objections, and close more deals.",
    deadline: new Date("2025-06-15"),
  },
];

// 30 objectives
const projectReviewObjectives = [
  { title: "Evaluate project scope and ensure alignment with objectives." },
  { title: "Assess project timeline and identify potential delays." },
  { title: "Review resource allocation to optimize efficiency." },
  { title: "Examine project budget for potential cost-saving opportunities." },
  { title: "Analyze risks and develop mitigation strategies." },
  { title: "Evaluate stakeholder communication and engagement." },
  { title: "Assess team dynamics and collaboration effectiveness." },
  { title: "Review project documentation for accuracy and completeness." },
  { title: "Evaluate adherence to project management methodologies." },
  { title: "Assess the quality of deliverables against set standards." },
  { title: "Examine the effectiveness of change management processes." },
  { title: "Review project progress against established milestones." },
  { title: "Evaluate the impact of external factors on project success." },
  {
    title:
      "Assess the alignment of project outcomes with organizational goals.",
  },
  { title: "Review the effectiveness of project leadership." },
  { title: "Evaluate the use of technology to support project goals." },
  { title: "Assess the clarity and effectiveness of project objectives." },
  { title: "Review the management of project dependencies." },
  { title: "Evaluate the effectiveness of problem-solving strategies." },
  { title: "Assess the level of stakeholder satisfaction." },
  { title: "Review the handling of project conflicts and resolutions." },
  {
    title:
      "Evaluate the implementation of lessons learned from previous projects.",
  },
  {
    title: "Assess the level of flexibility in project management approaches.",
  },
  { title: "Review the utilization of project management tools and software." },
  { title: "Evaluate the level of innovation in project execution." },
  {
    title:
      "Assess the alignment of project outcomes with customer expectations.",
  },
  { title: "Review the effectiveness of project reporting mechanisms." },
  { title: "Evaluate the transparency of project decision-making processes." },
  {
    title:
      "Assess the sustainability considerations integrated into the project.",
  },
  { title: "Review the effectiveness of project risk management strategies." },
];

// 30 actions
const projectReviewActions = [
  {
    content:
      "Conduct a thorough analysis of project risks and identify potential mitigation strategies.",
  },
  {
    content:
      "Review project documentation for accuracy and completeness, updating as necessary.",
  },
  {
    content:
      "Hold regular meetings with stakeholders to gather feedback and ensure alignment with project goals.",
  },
  {
    content:
      "Monitor project progress against key milestones and adjust plans as needed to stay on track.",
  },
  {
    content:
      "Communicate project updates and important information to all team members in a timely manner.",
  },
  {
    content:
      "Collaborate with team members to troubleshoot any issues and find creative solutions.",
  },
  {
    content:
      "Document lessons learned throughout the project to inform future initiatives and improve processes.",
  },
  {
    content:
      "Regularly assess project budget and resource allocation to identify potential areas for optimization.",
  },
  {
    content:
      "Ensure that all project deliverables meet quality standards and fulfill stakeholder requirements.",
  },
  {
    content:
      "Track and manage project dependencies to minimize delays and ensure smooth execution.",
  },
  {
    content:
      "Implement effective change management strategies to minimize disruption and maximize adoption.",
  },
  {
    content:
      "Monitor stakeholder satisfaction and address any concerns or feedback in a proactive manner.",
  },
  {
    content:
      "Utilize project management tools and software to streamline processes and improve efficiency.",
  },
  {
    content:
      "Regularly review and update project timelines to reflect changes and ensure accuracy.",
  },
  {
    content:
      "Maintain open and transparent communication channels to foster trust and collaboration.",
  },
  {
    content:
      "Proactively identify and address potential roadblocks or obstacles to project success.",
  },
  {
    content:
      "Seek input and feedback from team members to continuously improve project processes and outcomes.",
  },
  {
    content:
      "Document and communicate project successes and achievements to stakeholders and team members.",
  },
  {
    content:
      "Monitor and manage project risks, escalating issues as needed to ensure timely resolution.",
  },
  {
    content:
      "Facilitate knowledge sharing and transfer within the team to promote learning and development.",
  },
  {
    content:
      "Regularly review project objectives and strategies to ensure alignment with organizational goals.",
  },
  {
    content:
      "Adapt project plans and strategies as needed to respond to changing circumstances or requirements.",
  },
  {
    content:
      "Ensure compliance with relevant regulations and standards throughout the project lifecycle.",
  },
  {
    content:
      "Regularly assess project performance and identify opportunities for process improvement.",
  },
  {
    content:
      "Promote a culture of accountability and ownership within the project team.",
  },
  {
    content:
      "Foster a positive and supportive team environment to enhance collaboration and productivity.",
  },
  {
    content:
      "Celebrate project milestones and achievements to boost team morale and motivation.",
  },
  {
    content:
      "Provide regular feedback and coaching to team members to support their professional growth.",
  },
  {
    content:
      "Monitor and manage project dependencies to minimize delays and ensure smooth execution.",
  },
  {
    content:
      "Maintain accurate and up-to-date project documentation to support decision-making and accountability.",
  },
  {
    content:
      "Regularly communicate project status updates to stakeholders and address any concerns or questions.",
  },
];

module.exports = {
  users,
  projects,
  tasks,
  comments,
  projectReviewObjectives,
  projectReviewActions,
};
