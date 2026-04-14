# Projects Folder Guide

Add one folder per project inside `Projects/`.

Example:

```text
Projects/
  project-01/
    01.jpg
    02.jpg
    03.jpeg
    04.gif
    05.mp4
  project-02/
    01.jpg
    02.jpg
```

Media rules:

- Use numbered filenames like `01`, `02`, `03`, `04`
- Supported formats: `.jpg`, `.jpeg`, `.gif`, `.mp4`
- Files are shown on the project page in numbered order

Project title, subtitle, description, and folder name are set in:

- `projects-data.js`

Each project entry should point to its folder, for example:

```js
{
  slug: "project-01",
  title: "My Project Title",
  subtitle: "Brand Identity",
  description: "A short two-line description of the project goes here.",
  category: "Case Study",
  folder: "Projects/project-01"
}
```
