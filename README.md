

# vue-auth-href 🔒

A VueJS directive for downloading files that are under a protected route schema (that needs an Authorization Header).
It's a common thing on projects to have routes that are wrapped by an authentication middleware. Sometimes, depending on the project security schema, the access to files can be protected too. The problem is, that when in your frontend you put a link (an anchor tag) to a file that is protected, it can be tricky to make the authorization process. This is where this little plugin comes to help.
This plugin comes in the form of a Vue.js directive that is ready to work with JWT auth schema. On the GET request made by an anchor tag when it's clicked, it adds the `Authorization: Bearer <TOKEN>` header automatically.

### Installation 📦
```bash
npm install --save vue-auth-href
```
### Initialization 🔧
```js
import Vue from 'vue'
import VueAuthHref from 'vue-auth-href'

// Not mandatory, options can be set inline
const options = {
  token: "<YOUR JWT TOKEN HERE>",
  // other options here (full list of options described below)
}
Vue.use(VueAuthHref, options)
```
### Usage 🕹
```html
<a v-auth-href href="https://link.to/your-file.zip">Your File</a>
```
##### Demo:
[GIF]

Some options can be passed inline to the directive, like:
```html
<a :v-auth-href="{token: 'TOKEN'}" href="https://link.to/your-file.zip">Your File</a>
```
### Options ⚙️
```


| Option | Type | Default | Can be set on | Description |
| --- | --- | --- | --- | --- |
| `token` | String |  | Initialization / Inline | The JWT Token used for authentication. This parameter is **REQUIRED**
| `headerAuthKey` | String | "Authorization" | Initialization | The key used in the authorization header
| `headerAuthValuePrefix` | String | "Bearer " | Initialization | The prefix of the value used in the authorization header
| `aditionalHeaders` | Object | {} | Initialization | Aditional headers to be sent on the request header. If it is setted, must be a javascript object
| `textMode` | String | "text" | Initialization / Inline | Indicates to use 'text' or 'html' when link is clicked (these two are the only possible values)
| `downloadingText` | String | "Downloading" | Initialization / Inline | Text to be shown when link is clicked and before the file is downloaded
| `downloadingText` | String | "Downloading" | Initialization / Inline | HTML to be shown when link is clicked and before the file is downloaded. Can be used, for instance, to display an icon (see examples below)
| `dotsAnimation` | Boolean | "true" | Initialization / Inline | Show the fancy dots animation when link is clicked. Works only when `textMode: 'text'`
```
