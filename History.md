Change Log
----
### 1.2.0
- Now using the [imdone-core](https://www.npmjs.org/package/imdone-core) library
- Create lists without having to create a task
- Add and remove projects in the UI
- Keyboard help with `?` or on Help menu
- Create a new task from the current line with `Alt+t`
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
