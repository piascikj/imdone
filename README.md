lean-on-md
==========

##Create tasks in markdown files and organize them with kanban using node.js to listen for file changes and a simple format that looks like this
  
###Put a task at the top of a list called "to-do"
   `[this is a task](t#to-do?0)`

###Put a task on the bottom of a list called "doing"
   `[this is a task](t#doing?1)`

###lean-on.md contains list names
- When a file is saved, the lean-on.md file will be checked for list names that exist in .md files

- [How will this work in github?](t#doing)


