Change Log
----
### 1.4.5
- Better task detection in code

### 1.4.4
- Fix code block replace in md files

### 1.4.3
- Added config.code.include_lists array for code tasks

### 1.4.2
- Recognize code style tasks in block comments.  
- #DOING: Needs more community input on languages.js

### 1.3.8
- Notify user of file change on disk

### 1.2.9
- Fix new list found
- `<Ctrl>+k` for new task
- Allow `#list:0` task syntax

### 1.2.3
- New task is now `<Ctrl>+n`. A little easier for the fingers:)
- Only select tasks that are visible on select all

### 1.2.0
- Now using the [imdone-core](https://www.npmjs.org/package/imdone-core) library
- Tours to get you started
- Create lists without having to create a task
- Add and remove projects in the UI
- Keyboard help with `?` or on Help menu
- Create a new task from the current line with `<Alt>+t`
- List names are in code completion list with `<Ctrl>+<Space>`
- Reopen projects that were open on last close.  This is merged with --dirs or directory imdone was started in.  Can also be editied in `~/.imdone/config.json`
- I had to do away with events to make the configuration JSON, but will consider bringing them back if there is enough demand.

### 1.1.3
- Add delay to sortable elements

### 1.1.1
- Fix line number of match

### 1.0.7
- Update events for better push updates

### 1.0.4
- Add callback to start for embedding

### 1.0.2
- Fix bug for rename list when code style comments don't have a sort order

### 1.0.1
- Fix firefox dropdown display bug

### 1.0.0
- Fix refresh on file rename, create, or delete
- Add support for code style tasks
- Fix browser open for imdone running on another port

### 0.6.6
- Hide archive and filter buttons when swithing projects

### 0.6.5
- Add archiving of tasks to existing archive or deleted list or create archive list
- Add filter by selected tasks filenames
- Allow regex in filter

### 0.6.4
- Add batch move tasks

### 0.5.6
- Add copy button to preview

### 0.5.2
- Fix valid task check for filetypes without a symbol

### 0.5.1
- Fix file save if modified and clicking on a search result
- Fix file route interpretation of preview boolean
