# In-Template JavaScript

## Table of Contents

* [Before You Get Started](#before-you-get-started)
* [`for` Loops](#for-loops)
* [`if-else` Conditionals](#if-else-conditionals)

## Before You Get Started

Jae can take in HTML with in-template JavaScript. That is, you can write JavaScript in your templates directly. Below are examples of `for` loops and `if-else` conditionals in templates.

## `for` Loops

### Input

```typescript
this.response.render(
  "template.html",
  {
    skills: [
      "Agility",
      "Strength",
      "Endurance",
    ]
  }
);
```

```html
<ul>
  <% for (let index in skills) { %>
  <li><% skills[index] %></li>
  <% } %>
</ul>
```

### Output

```html
<ul>
  <li>Agility</li>
  <li>Strength</li>
  <li>Endurance</li>
</ul>
```

## `if-else` Conditionals

### Input

```typescript
this.response.render(
  "template.html",
  {
    skills: [
      "Agility",
      "Strength",
      "Endurance",
    ]
  }
);
```

```html
<ul>
  <% for (let index in skills) { %>
    <% if (skills[index] != "Agility") { %>
  <li><% skills[index] %></li>
    <% } %>
  <% } %>
</ul>
```

### Output

```html
<ul>
  <li>Strength</li>
  <li>Endurance</li>
</ul>
```
