import axios from "axios"

const VueAuthDownload = {
  install(Vue, pluginOptions) {
    Vue.directive("auth-href", {
      bind: function(element, binding) {
        setClickListener(element, binding, pluginOptions)
      },
      componentUpdated: function(element, binding) {
        setClickListener(element, binding, pluginOptions)
      },
    })
  },
}

/**
 * @param {Object} object
 * @param {string} key
 * @return {any} value
 * @author ShortFuse
 * @see {@link https://stackoverflow.com/a/47538066 Stack Overflow source post}
 */
function getParameterCaseInsensitive(object, key) {
  return object[Object.keys(object).find(k => k.toLowerCase() === key.toLowerCase())]
}

function setClickListener(element, binding, pluginOptions) {
  if (binding.oldValue === undefined || binding.value !== binding.oldValue) {
    element.removeEventListener("click", eventClick.bind(null, element, binding, pluginOptions))
    element.addEventListener("click", eventClick.bind(null, element, binding, pluginOptions))
  }
}

const files = {}

function eventClick(element, binding, pluginOptions) {
  // prevent default click action (click on a link)
  event && event.preventDefault()

  // store the original href locally
  const href = element.href

  // Default options values
  const options = {
    token: "",
    headerAuthKey: "Authorization",
    headerAuthValuePrefix: "Bearer ",
    aditionalHeaders: {},

    textMode: "text",
    downloadingText: "Downloading",
    downloadingHtml: "",
    dotsAnimation: true,
    overrideInnerHtml: true,
  }

  // try to get the values
  // TOKEN:
  if (typeof binding.value === "object" && binding.value.token && binding.value.token !== "") {
    options.token = binding.value.token
  } else if (
    typeof pluginOptions === "object" &&
    pluginOptions.token &&
    typeof pluginOptions.token === "function"
  ) {
    options.token = pluginOptions.token()
  } else {
    throw Error(
      "v-auth-href: You must provide the Token via options on instanciate or v-auth-href values",
    )
  }

  // Header: auth key (only via options)
  if (
    typeof pluginOptions === "object" &&
    pluginOptions.headerAuthKey &&
    pluginOptions.headerAuthKey !== ""
  ) {
    options.headerAuthKey = pluginOptions.headerAuthKey
  }

  // Header: auth value prefix (Bearer) (only via options)
  if (
    typeof pluginOptions === "object" &&
    pluginOptions.headerAuthValuePrefix &&
    pluginOptions.headerAuthValuePrefix !== ""
  ) {
    options.headerAuthValuePrefix = pluginOptions.headerAuthValuePrefix
  }

  // Header: aditional headers
  if (typeof pluginOptions === "object") {
    // There was a typo in 'aditionalHeaders', so check for both 'aditionalHeaders' and 'additionalHeaders'
    //
    if (pluginOptions.aditionalHeaders && typeof pluginOptions.aditionalHeaders === "object") {
      options.additionalHeaders = pluginOptions.aditionalHeaders
    } else if (
      pluginOptions.additionalHeaders &&
      typeof pluginOptions.additionalHeaders === "object"
    ) {
      options.additionalHeaders = pluginOptions.additionalHeaders
    }
  }

  // Plugin text mode (text or html)
  if (
    typeof binding.value === "object" &&
    binding.value.textMode &&
    binding.value.textMode !== ""
  ) {
    options.textMode = binding.value.textMode
  } else if (
    typeof pluginOptions === "object" &&
    pluginOptions.textMode &&
    pluginOptions.textMode !== ""
  ) {
    options.textMode = pluginOptions.textMode
  }
  if (!["text", "html"].includes(options.textMode)) {
    throw Error("v-auth-href: textMode must be 'text' or 'html'")
  }

  if (options.textMode === "text") {
    // downloadingText
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

    // dotsAnimation
    if (typeof binding.value === "object" && binding.value.dotsAnimation !== undefined) {
      options.dotsAnimation = Boolean(binding.value.dotsAnimation)
    } else if (typeof pluginOptions === "object" && pluginOptions.dotsAnimation !== undefined) {
      options.dotsAnimation = Boolean(pluginOptions.dotsAnimation)
    }
  } else if (options.textMode === "html") {
    // downloadingHtml
    if (
      typeof binding.value === "object" &&
      binding.value.downloadingHtml &&
      binding.value.downloadingHtml !== ""
    ) {
      options.downloadingHtml = binding.value.downloadingHtml
    } else if (
      typeof pluginOptions === "object" &&
      pluginOptions.downloadingHtml &&
      pluginOptions.downloadingHtml !== ""
    ) {
      options.downloadingHtml = pluginOptions.downloadingHtml
    }
  }
  // overrideInnerHtml
  if (typeof binding.value === "object" && binding.value.overrideInnerHtml !== undefined) {
    options.overrideInnerHtml = Boolean(binding.value.overrideInnerHtml)
  } else if (typeof pluginOptions === "object" && pluginOptions.overrideInnerHtml !== undefined) {
    options.overrideInnerHtml = Boolean(pluginOptions.overrideInnerHtml)
  }

  // check if the attribete data-downloading is present. If it isn't, add it. If it's present, the link was already clicked so cancel the operation
  const isDownloading = element.getAttribute("data-downloading")
  if (!isDownloading) {
    element.setAttribute("data-downloading", "true")
  } else {
    return false
  }

  if (options.overrideInnerHtml) {
    // Save the original HTML node content and put the fancy message
    files[href] = element.innerHTML
    element.innerHTML =
      options.textMode === "text" ? options.downloadingText : options.downloadingHtml
  }

  // Remove the original href to prevent click it more than once and also remove the anchor styles
  element.removeAttribute("href")

  // Sets the dots animation
  let interval
  if (
    options.textMode === "text" &&
    options.dotsAnimation === true &&
    options.overrideInnerHtml === true
  ) {
    interval = setInterval(() => {
      element.innerHTML += "."
      if (element.innerHTML.length === options.downloadingText.length + 3) {
        element.innerHTML = options.downloadingText
      }
    }, 500)
  }

  const authHeader = {}
  authHeader[options.headerAuthKey] = `${options.headerAuthValuePrefix}${options.token}`

  axios({
    method: "GET",
    url: href,
    responseType: "blob",
    headers: {
      ...authHeader,
      ...options.aditionalHeaders,
    },
  })
    .then(response => {
      // Take the response and fire the download process
      const blob = new Blob([response.data], { type: response.data.type })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      const contentDisposition = getParameterCaseInsensitive(
        response.headers,
        "Content-Disposition",
      )
      let fileName = href.substring(href.lastIndexOf("/") + 1)
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/)
        if (fileNameMatch != null && fileNameMatch.length === 2) {
          fileName = fileNameMatch[1]
          // content disposition filename is usually url encoded
          fileName = fileName.replace(/\+/g, "%20")
          fileName = decodeURIComponent(fileName)
        }
      }
      if (element.hasAttribute("target")) {
        link.setAttribute("target", element.target)
      } else {
        link.setAttribute("download", fileName)
      }
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
      if (options.overrideInnerHtml === true) {
        if (options.textMode === "text" && options.dotsAnimation === true) {
          clearInterval(interval)
        }
        element.innerHTML = files[href]
      }
      element.setAttribute("href", href)
      element.removeAttribute("data-downloading")
    })
}

export default VueAuthDownload
