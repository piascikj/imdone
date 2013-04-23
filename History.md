#0.1.36
- Notify user when file is modified
- Show notification with link to project README if it exists

#0.1.35
- On opening of file, set the project at the global level
- For markdown files, labels for task links
- Preview edit and print keyboard shortcuts

#0.1.34
- Better usability with navbar when in file edit/preview (no lists button or filter).

#0.1.33
- Links to other files in project are opened in preview mode
- **example**
    
    `[This is a link to README.md](README.md)`

[This is a link to README.md](README.md)

#0.1.32
- Apply filter unless it is cleared
- Enable browser history by implementing routes for project and file
- All dependencies up to date

#0.1.31
- Fixed history needed shift instead of pop
- Fixed file name change on load of new file

#0.1.29
- Added recent files to open dialog
- Made editor full page width
- Added notification for current task
- Added notification for save
- Added prominant close file button
- Removed open in github option
 
#0.1.28
- Display filename on edit radio button

#0.1.27
- Fix styles for code (Eliminate box shadow)

#0.1.26
- Allow user to create files

#0.1.25
- Sort lists in dropdown menu
- Open files for editing
- Loading dependencies with require (Strange workaround for ace)

#0.1.24
- Print source and markdown preview

#0.1.23
- Upgrade express to latest version
- Preview markdown files

#0.1.22
- Fix rename list bug introduced in last version

#0.1.20
- Open multiple projects at once from command line

#0.1.19
- Bug fixes.  Sorting tasks was broken

#0.1.18
- Dark theme
- Ace editor

#0.1.17
- Now using commander for better cli user experience

#0.1.14
- replace mu2 with Handlebars

#0.1.13
- Moved open page to open cli option
- switched to socket.io for near real-time updates

#0.1.11
- Now able to hide a list from board using hidden
##imdone/data.js is now formatted like this  
  
    {
		lists:[Array of list names],
		hidden:[Array of list names to hide]
	}

#0.1.10
- Source view if github is not set
- Default lists are respected if added to imdone/data.js
- Lists won't be removed unless specifically removed in ui or imdone/data.js

#0.1.8
- Sort is fixed for multiple projects

#0.1.7
- Start in multiple project directories

#0.1.6
- Added filter by file name

#0.1.4
- Use line number when loading page in github

#0.1.3
- include added to config for files to include.  Order is include > Exclude

#0.1.2
- Using websockets to refresh board on changes
