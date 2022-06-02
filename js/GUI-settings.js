export default class GUISettings {
  settingsHolder;
  scrollWrapper;

  CLASSES = {
    HOLDER_CLASS: "settings-holder",
    HIDDEN_CLASS: "hidden",
    SCROLL_WRAPPER_CLASS: "settings-scroll-wrapper",
    CLOSE_BTN_CLASS: "settings-close-btn",
    ROW_CLASS: "settings-row",
    INPUT_CLASS: "settings-input",
    TEXTAREA_CLASS: "settings-textarea",
    CHECKBOX_CLASS: "settings-checkbox",
    LABEL_CLASS: "settings-label",
    SELECT_CLASS: "settings-select",
    FONT_SELECT_MODIFIER: "font-select",

    POPUP_CLASS: 'feed-popup',
    POPUP_SCROLL_WRAPPER_CLASS: 'feed-popup-scroll-wrapper',
    POPUP_CLOSE_BTN_CLASS: 'popup-close-btn',
    FEED_PICKER_BTN_CLASS: 'feed-picker-btn',
    FEED_LIST_CLASS: 'feed-list',
    FEED_LIST_ITEM_CLASS: 'feed-list-item',
    FEED_LIST_RADIO_BTN_CLASS: 'feed-list-radio-btn',
    FEED_LIST_RADIO_LABEL_CLASS: 'feed-list-radio-label',
    OPENED_POPUP_MODIFIER: 'is-opened-popup'
  };

  DEFAULT_FONTS_LIST = [
    'Arial', 
    'sans-serif', 
    'Comic Sans'
  ]

  constructor(Widget, callback, options) {
    this.widgetWrapper = options.widgetWrapper;
    this.expanded = options.expanded;
    this.callback = callback;
    this.addHiddenFields(Widget);
    this.createMarkup(Widget);
    this.createStyles();
    this.addListeners(Widget);
    this.setValues(Widget.properties);
    this.setWrapperWidth(Widget);
    
    callback();
  }

  /**
   * Adds Widget.width, Widget.height, font.createFontFace(text), feed.load()
   */
  addHiddenFields(Widget) {
    const defaults = {
      enumerable: true,
      configurable: true,
      writable: true
    }
    Object.defineProperty(Widget, 'width', {
      ...defaults, 
      value: 0
    });
    Object.defineProperty(Widget, 'height', {
      ...defaults, 
      value: 0
    });
    

    Object.keys(Widget.properties).forEach(key => {
      let value = Widget.properties[key];

      if (typeof value === 'object' && !Array.isArray(value)) {
        if (value?.id) {
          //add font method createFontFace()
          Object.defineProperty(Widget.properties[key], 'createFontFace', {
            ...defaults, 
            value: function (text) {
              return new Promise(res => {
                setTimeout(function() {
                  res();
                }, 50);
              });
            }
          });
        }

        // add feed method load()
        if (value?.data) {
          Object.defineProperty(Widget.properties[key], 'load', {
            ...defaults,
            value: function () {
              return new Promise(res => {
                const storedValue = value;
                setTimeout(function() {
                  res(storedValue);
                }, 50);
              });
            }
          });
        }
      }
    });
  }

  createMarkup(Widget) {
    const _ = this.CLASSES;
    this.settingsHolder = document.createElement("div");
    this.scrollWrapper = document.createElement("div");
    this.closeBtn = document.createElement("button");

    // create main markup
    this.settingsHolder.className = `${_.HOLDER_CLASS}`;

    if (!this.expanded) {
      this.settingsHolder.className += `  ${_.HIDDEN_CLASS}`;
    }

    //settings scroll wrapper
    this.scrollWrapper.className = `${_.SCROLL_WRAPPER_CLASS}`;

    //create close btn
    this.closeBtn.className = `${_.CLOSE_BTN_CLASS}`;
    this.closeBtn.setAttribute("title", "Toggle settings menu");

    this.settingsHolder.prepend(this.closeBtn);

    // create settings rows
    Object.keys(Widget.properties).forEach((key) => {
      const settingsRow = document.createElement("div");
      settingsRow.className = `${_.ROW_CLASS}`;

      let value = Widget.properties[key];

      // create inputs or selects
      const inputTypes = ['string', 'number', 'boolean'];

      // if the value is a simple value
      if (inputTypes.includes(typeof value)) {
        let inputGroup = this.createInput(value, key);

        inputGroup.forEach((item) => settingsRow.appendChild(item));

      // if value is array or object
      } else if (typeof value === 'object') {
        let fontSelect = false;

        // if value is array (simple select setting) or value has an id key (for font)
        if (Array.isArray(value) || value?.id) {

          if (value?.id) {
            fontSelect = true;
            value = this.DEFAULT_FONTS_LIST.includes(value.id) ? this.DEFAULT_FONTS_LIST : [value.id, ...this.DEFAULT_FONTS_LIST];
          }

          let selectGroup = this.createSelect(value, key, fontSelect);
          selectGroup.forEach((item) => settingsRow.appendChild(item));
        // if value has a data key (feed)
        } else if (value?.data) {  
          let feedPickGroup = this.createFeedPickGroup(value.data, key, Widget);

          feedPickGroup.forEach(item => settingsRow.appendChild(item));
        }
      }

      this.scrollWrapper.appendChild(settingsRow);
    });

    this.settingsHolder.appendChild(this.scrollWrapper);

    document.body.appendChild(this.settingsHolder);
  }

  splitAndCapitalize(value) {
    let splitBetweenCamelCaseRE = /(?<=.)(?=[A-Z])/g;
    let splitIntoWords = value.split(splitBetweenCamelCaseRE);

    splitIntoWords.forEach((item, i, arr) => {
        arr[i] = item[0][`to${i === 0 ? 'Upper':'Lower'}Case`]() + item.slice(1, item.length); 
    });

    return splitIntoWords.join(' ');
  }

  createInput(value, key) {
    const _ = this.CLASSES;
    let type;

    switch (typeof value) {
      case "number":
        type = "number";

        break;
      case "string":
        if (value.includes("#") || value.includes('rgba(')) {
          type = "color";
        } else {
          type = "text";
        }
        break;
      case "boolean":
        type = "checkbox";
        break;
    }
    let input;
    let className;

    if (type !== 'text') {
      input = document.createElement("input");
      input.type = type;
      className = _.INPUT_CLASS;
    } else {
      input = document.createElement('textarea');
      className = _.TEXTAREA_CLASS;
    }
    
    input.id = key;
    input.name = key;
    input.value = value;
    input.className = className;

    
    const label = document.createElement("label");
    label.setAttribute("for", `${key}`);
    label.innerText = `${this.splitAndCapitalize(key)}: `;
    label.className = `${_.LABEL_CLASS}`;

    if (type === "checkbox") {
      label.className += ` ${_.CHECKBOX_CLASS}`;
      input.checked = value;
    }

    return [label, input];
  }

  createSelect(values, key, fontSelect) {
    const _ = this.CLASSES;
    let select = document.createElement("select");
    let label = document.createElement("label");

    // select
    select.id = `${key}`;
    select.name = `${key}`;
    select.className = `${_.SELECT_CLASS}`;

    if (fontSelect) {
      select.className += ` ${_.FONT_SELECT_MODIFIER}`;
    } 

    values.forEach((value, i) => {
      let option = document.createElement("option");

      option.value = value;
      option.innerText = value.replace(/(^\w)/i, (letter) =>
        letter.toUpperCase()
      );

      if (i === 0) {
        option.setAttribute('selected', true);
      }

      select.appendChild(option);
    });

    // label
    label.className = `${_.LABEL_CLASS}`;
    label.setAttribute("for", `${key}`);
    label.innerText = `${this.splitAndCapitalize(key)}`;

    return [label, select];
  }

  createFeedPickGroup(feedsList, key, Widget) {
    const _ = this.CLASSES;
    const feedPickerBtn = document.createElement("button");
    const label = document.createElement("label");

    //create feed picker
    feedPickerBtn.classList.add(_.FEED_PICKER_BTN_CLASS);
    feedPickerBtn.innerText = 'Select feed';


    label.className = `${_.LABEL_CLASS}`;
    label.innerText = this.splitAndCapitalize(key);

    // create popup
    this.createPopup(feedPickerBtn, feedsList, Widget, key);

    return [label, feedPickerBtn];
  }

  createPopup(feedPicker, feedsList, Widget, propertyKey) {
    const _ = this.CLASSES;
    const popup = document.createElement('div');
    const popupScroller = document.createElement('div');
    const popupList = document.createElement('ol');
    const popupCloseBtn = document.createElement('button');

    popup.className = _.POPUP_CLASS;
    popupList.className = _.FEED_LIST_CLASS;
    popupCloseBtn.className = _.POPUP_CLOSE_BTN_CLASS;
    popupScroller.className = _.POPUP_SCROLL_WRAPPER_CLASS;

    //create popup feed list
    feedsList.forEach((item, i) => {
      const popupListItem = document.createElement('li');
      const radioBtn = document.createElement('input');
      const label = document.createElement('label');

      popupListItem.className = _.FEED_LIST_ITEM_CLASS;

      // create radio group
      radioBtn.type = 'radio';
      radioBtn.name = propertyKey;
      radioBtn.id = `Feed ${i+1}`;
      radioBtn.value = JSON.stringify(item);
      radioBtn.className = _.FEED_LIST_RADIO_BTN_CLASS;

      radioBtn.addEventListener('change', (e) => {
        feedPicker.innerText = e.target.id;
      })

      label.setAttribute('for', `Feed ${i+1}`);
      label.innerText = `Feed ${i+1}`;
      label.className = _.FEED_LIST_RADIO_LABEL_CLASS;

      [radioBtn, label].forEach(radioGroupItem => {
        popupListItem.appendChild(radioGroupItem);
      });

      popupList.appendChild(popupListItem);
    });

    //add listener to feedPicker for open popup
    feedPicker.addEventListener('click', (e) => {
      e.stopPropagation();
      popup.classList.toggle(_.OPENED_POPUP_MODIFIER);
    });

    //add listeners for closing popup
    //close btn
    popupCloseBtn.addEventListener('click', () => {
      popup.classList.remove(_.OPENED_POPUP_MODIFIER);
    });

    //click outside
    window.addEventListener('click', (e) => {
      const popupSelector = `.${_.OPENED_POPUP_MODIFIER}`; 
      if (!document.querySelector(popupSelector)) return;

      const clickedOutsideThePopup = !e.target.closest(`.${_.POPUP_CLASS}`);

      if (clickedOutsideThePopup) {
        popup.classList.remove(_.OPENED_POPUP_MODIFIER);
      }
    });

    popup.appendChild(popupCloseBtn);
    popupScroller.appendChild(popupList);
    popup.appendChild(popupScroller);

    this.settingsHolder.appendChild(popup);
  }

  createStyles() {
    const _ = this.CLASSES;
    const style = document.createElement("style");
    const styleString = `
    *,
    *::before,
    *::after {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        outline: none;
    }

    button:focus,
    button:active {
        outline: none;
        box-shadow: none;
    }

    .${_.HOLDER_CLASS} {
        position: fixed;
        top: 0;
        left: 0;
        width: 300px;
        max-height: 100%;
        padding: 5px;
        background-color: rgba(255,255,255, .5);
        box-shadow: 0 0 5px 2px rgba(0,0,0, .2);
        transition: transform .3s;
    }

    .${_.SCROLL_WRAPPER_CLASS} {
        height: 100%;
        max-height: calc(100vh - 10px);
        overflow-y: auto;
    }

    .${_.HOLDER_CLASS}.${_.HIDDEN_CLASS} {
        transform: translateX(-100%);
    }

    .${_.CLOSE_BTN_CLASS} {
        position: absolute;
        top: 0;
        left: 100%;
        width: 20px;
        height: 20px;
        border: 1px solid black;
        background-color: inherit;
        box-shadow: 3px 0 5px 2px rgba(0,0,0, .2);
        cursor: pointer;
    }

    .${_.CLOSE_BTN_CLASS}::after {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 10px;
        height: 10px;
        margin-left: 3px;
        border: solid black;
        border-width: 2px 0 0 2px;
        transform: translate(-50%, -50%) rotate(-45deg);
        content: '';
    }

    .${_.HOLDER_CLASS}.${_.HIDDEN_CLASS} .${_.CLOSE_BTN_CLASS} {
        transform: scale(-1);
    }

    .${_.ROW_CLASS} {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        padding: 5px;
    }

    .${_.LABEL_CLASS} {
        display: block;
        margin-bottom: 3px;
    }

    .${_.LABEL_CLASS}.${_.CHECKBOX_CLASS} {
        display: inline-block;
        margin-bottom: 0;
    }

    .${_.INPUT_CLASS} {
        max-width: 100%;
        height: 20px;
        padding: 0 10px;
      
    }

    .${_.SELECT_CLASS} {
        display: block;
        width: 100%;
        height: 20px;
        padding: 0 8px;
    }

    .${_.TEXTAREA_CLASS} {
      width: 100%;
      resize: vertical;
      min-height: 40px;
      max-height: 180px;
      padding: 3px 10px;
    }

    .${_.POPUP_CLASS} {
      position: fixed;
      top: 50%;
      left: 50%;
      display: flex;
      flex-direction: column;
      width: 300px;
      height: 300px;
      overflow: auto;
      border-radius: 5px;
      background-color: white; 
      box-shadow: 0 0 3px 2px rgba(0,0,0, .2);
      transform: translate(-50%, -50%);
      opacity: 0;
      transition: opacity .5s;
      pointer-events: none;
    }

    .${_.POPUP_SCROLL_WRAPPER_CLASS} {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      width: 100%;
      padding: 30px;
    }

    .${_.OPENED_POPUP_MODIFIER} {
      opacity: 1;
      pointer-events: auto;
    }

    .${_.FEED_PICKER_BTN_CLASS} {
      min-width: 80px;
      padding: 3px 5px;
      border-radius: 3px;
      border: 1px solid lightblue;
      color: cadetblue;
      cursor: pointer;
      transition: box-shadow .3s;
    }

    .${_.FEED_PICKER_BTN_CLASS}:hover,
    .${_.FEED_PICKER_BTN_CLASS}:active {
      box-shadow: 0 0 3px 2px rgba(0, 80, 255, .2);
    }

    .${_.POPUP_CLOSE_BTN_CLASS} {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 25px;
      height: 25px;
      background: none;
      color: black;
      transition: color .3s;
      border: none;
      cursor: pointer;
    }

    .${_.POPUP_CLOSE_BTN_CLASS}:hover {
      color: tomato;
    }
    
    .${_.POPUP_CLOSE_BTN_CLASS}::before,
    .${_.POPUP_CLOSE_BTN_CLASS}::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 22px;
        height: 2px;
        background-color: currentColor;
    }
    
    .${_.POPUP_CLOSE_BTN_CLASS}::before {
        transform: translate(-50%, -50%) rotate(-45deg);
    }
    
    .${_.POPUP_CLOSE_BTN_CLASS}::after {
        transform: translate(-50%, -50%) rotate(45deg);
    }
    
    .${_.FEED_LIST_CLASS} {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        list-style: none;
    }
    
    .${_.FEED_LIST_ITEM_CLASS} {
        position: relative;
        padding: 5px;
        border-radius: 5px;
    }
    
    .${_.FEED_LIST_ITEM_CLASS}:nth-child(even) {
        background-color: rgba(0,0,0, .1);
    }
    
    .${_.FEED_LIST_RADIO_BTN_CLASS} {
        position: absolute;
        top: 0;
        left: 0;
        width: 0;
        height: 0;
        opacity: 0;
        pointer-events: none;
    }
    
    .${_.FEED_LIST_RADIO_LABEL_CLASS} {
        display: block;
        position: relative;
        width: 100%;
        cursor: pointer;
    }
    
    .${_.FEED_LIST_RADIO_LABEL_CLASS}::before,
    .${_.FEED_LIST_RADIO_LABEL_CLASS}::after {
        content: '';
        position: absolute;
        right: calc(100% + 10px);
        transition: all .3s;
    }
    
    .${_.FEED_LIST_RADIO_LABEL_CLASS}::before {
        top: 0;
        width: 20px;
        height: 20px;
        border: 1px solid cadetblue;
        border-radius: 3px;
    }
    
    .${_.FEED_LIST_RADIO_LABEL_CLASS}::after {
        top: 1px;
        right: calc(100% + 15px);
        width: 9px;
        height: 12px;
        color: rgb(56, 43, 131);
        border-bottom: 2px solid currentColor;
        border-right: 2px solid currentColor;
        transform: rotate(45deg);
        opacity: 0;
    }
    
    .${_.FEED_LIST_RADIO_LABEL_CLASS}:hover::before {
        border-color: rgb(56, 43, 131);
        box-shadow: 0 0 25px rgba(0,0,0,.1);
    }
    
    .${_.FEED_LIST_RADIO_BTN_CLASS}:checked + .feed-list-radio-label::before {
        border-color:rgb(56, 43, 131);
    }
    
    .${_.FEED_LIST_RADIO_BTN_CLASS}:checked + .feed-list-radio-label::after {
        opacity: 1;
    }
    `;
    style.innerHTML = styleString;

    this.settingsHolder.prepend(style);
  }

  setWrapperWidth(Widget) {
    Widget.width = this.widgetWrapper.offsetWidth;
    Widget.height = this.widgetWrapper.offsetHeight;
  }

  addListeners(Widget) {
    // listen to the input event
    this.settingsHolder.addEventListener("input", (e) => {
      this.applyChanges(e, Widget.properties);
    });

    // toggle button
    this.closeBtn.addEventListener("click", () => {
      this.settingsHolder.classList.toggle("hidden");
    });

    window.addEventListener('resize', this.setWrapperWidth.bind(this));
  }

  /**
   * @method Sets raw values to the Widget.properties object, font.id and feed.data
  */
  setValues(widgetProperties) {
    const inputs = this.settingsHolder.querySelectorAll('[name]');
    inputs.forEach(input => {
      const name = input.name;
      const type = input.type;

      let value = input.value;

      if (type === 'checkbox') {
        value = input.checked;
      } else if (type === 'number') {
        value = parseInt(value);
      } else if (type === 'radio') {
        // don't set feed on widget init step
        value = null;
      }

      // rewrite font field value
      if (input.classList.contains(this.CLASSES.FONT_SELECT_MODIFIER)) {
        widgetProperties[name].id = value;
      // rewrite feed field value
      } else if (type === 'radio') {
        widgetProperties[name].data = value;
      // rewrite a field with a raw value
      } else {
        widgetProperties[name] = value;
      }
    });
  }

  applyChanges(e, widgetProperties) {
    let type = e.target.type;
    let value = e.target.value;
    let name = e.target.name;

    if (type === "number") {
      value = parseInt(value);
    } else if (type === "checkbox") {
      value = e.target.checked;
    } else if (type === 'radio') {
      value = JSON.parse(e.target.value);
    }

    if (e.target.classList.contains(this.CLASSES.FONT_SELECT_MODIFIER)) {
      widgetProperties[name].id = value;
    } else if (type === 'radio') {
      widgetProperties[name].data = value;
    } else {
      widgetProperties[name] = value;
    }

    this.callback();
  }
}
