import axios from "axios"

// This is your plugin object. It can be exported to be used anywhere.
const VueAuthDownload = {
  // The install method is all that needs to exist on the plugin object.
  // It takes the global Vue object as well as user-defined options.
  install(Vue, pluginOptions) {
    Vue.directive("auth-href-test", {
      bind: function(element, binding) {
        setClickListener(element, binding, pluginOptions)
      },
      componentUpdated: function(element, binding) {
        setClickListener(element, binding, pluginOptions)
      },
    })
  },
}

function setClickListener(element, binding, pluginOptions) {
  // Si quiesiera acceder al argumento del la directiva (lo que esta luego de los :) o al valor,
  // let type = binding.arg
  // let myFunction = binding.value
  if (binding.oldValue === undefined || binding.value !== binding.oldValue) {
    // como a la directiva no le pasamos ningun value, lo extraigo directamente del element al href
    element.removeEventListener(
      "click",
      eventClick.bind(null, element, binding, pluginOptions),
    )
    element.addEventListener(
      "click",
      eventClick.bind(null, element, binding, pluginOptions),
    )
  }
}

const files = {}

function eventClick(element, binding, pluginOptions) {
  // prevent default click action (click on a link)
  event.preventDefault()

  // store the original href locally
  const href = element.href

  // options default values
  const options = {
    token: "",
    downloadingText: "Downloading",
    textMode: "text",
  }

  // try to get the values
  if (
    typeof binding.value === "object" &&
    binding.value.token &&
    binding.value.token !== ""
  ) {
    options.token = binding.value.token
  } else if (
    typeof pluginOptions === "object" &&
    pluginOptions.token &&
    pluginOptions.token !== ""
  ) {
    options.token = pluginOptions.token
  } else {
    throw Error(
      "You must provide the Token via options on instanciate or v-auth-href values",
    )
  }

  if (pluginOptions.textMode === "text") {
    if (
      typeof binding.value === "object" &&
      binding.value.downloadingText &&
      binding.value.downloadingText !== ""
    ) {
      options.downloadingText = binding.value.downloadingText
    } else if (
      typeof pluginOptions === "object" &&
      pluginOptions.downloadingText &&
      pluginOptions.downloadingText !== ""
    ) {
      options.downloadingText = pluginOptions.downloadingText
    }
  }

  // check if the attribete data-downloading is present. If it isn't, add it. If it's present, the link was already clicked so cancel the operation
  const isDownloading = element.getAttribute("data-downloading")
  if (!isDownloading) {
    element.setAttribute("data-downloading", "true")
  } else {
    return false
  }

  // Store the node original HTML content and put the fancy message
  files[href] = element.innerHTML
  element.innerHTML =
    pluginOptions.textMode === "text"
      ? options.downloadingText
      : pluginOptions.downloadingHtml
  element.removeAttribute("href") // Remove the original href to prevent click it more than once (and remove the styles)

  // This is for the dots animation
  const interval = setInterval(() => {
    element.innerHTML += "."
    if (element.innerHTML.length === options.downloadingText.length + 3) {
      element.innerHTML = options.downloadingText
    }
  }, 500)

  axios({
    method: "GET",
    url: href,
    responseType: "blob",
    headers: {
      Authorization: `Bearer ${options.token}`,
    },
  })
    .then(response => {
      // Take the response and fire the download process
      const blob = new Blob([response.data], { type: response.data.type })
      // saveAs(blob, lastPartOfPath(href))

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      const contentDisposition = response.headers["content-disposition"]
      let fileName = href.substring(href.lastIndexOf("/") + 1)
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/)
        if (fileNameMatch.length === 2) fileName = fileNameMatch[1]
      }
      link.setAttribute("download", fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    })
    .catch(e => {
      throw e
    })
    .finally(() => {
      // Restore the link back to it's original state
      clearInterval(interval)
      element.innerHTML = files[href]
      element.setAttribute("href", href)
      element.removeAttribute("data-downloading")
    })
}

export default VueAuthDownload
