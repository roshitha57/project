TO-DO LIST APPLICATIONS

A simple and feature-rich To-Do List web application built using HTML, CSS, and Vanilla JavaScript.
This application helps users manage tasks efficiently with priorities, filters, theme switching, and persistent storage using LocalStorage.

FEATURES

1.Add new tasks

2.Set task priorities (High, Medium, Low)

3.Mark tasks as completed or pending

4.Filter tasks by:

->All

->Pending

->Completed

->High Priority

5.Light and Dark mode toggle

6.Delete individual tasks

Clear completed tasks

7.Clear all tasks

8.Live task statistics:

->Total tasks

->Completed tasks

->Pending tasks

9.Animated notifications for user actions

10.Data persistence using LocalStorage

 TECHNOLOGIES USED

1.HTML5

2.CSS3

3.JavaScript (ES6)

4.LocalStorage API

5.Font Awesome Icons

PROJECT STRUCTURE
todo-list-project/
│
├── index.html
├── style.css
├── script.js
└── README.md

HOW IT WORKS

1.Tasks are stored as objects containing id, text, priority, completion status, and creation time.

2.All tasks are saved in the browser’s LocalStorage, ensuring data persistence.

3.Filters dynamically update the task list without reloading the page.

4.The selected theme (light or dark) is also saved in LocalStorage.

FUTURE ENHANCEMENTS

->Edit existing tasks

->Add due dates and reminders

->Search functionality

->Cloud synchronization

->Mobile application version
