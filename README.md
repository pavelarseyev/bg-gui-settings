# gui-settings
creates a gui for settings object


## Usage:

#### 1. Create an object Widget with object field called 'properties'.

```javascript
const Widget = {
  properties: {
    number: 1, // will create an input type number
    string: 'string', // will create an input type text
    list: ['item1', 'item2', 'item3'], // will create a select with array values
    booleanValue: true, // will create a checkbox
    color: '#ffffff' // should be as full HEX color starting with "#". Will create an input type color
  }
}
```

#### 2. Create an instance of GUISettings object passing needed parameters
```javascript
function callback() {
  console.log('fired after properties change');
}

new GUISettings(Widget.properties, callback, true);
```

---
#### 3. Parameters:
1. Object with properties which we are going to change
2. Callback function which will be fired on object created and some property changed.
3. [optional] Boolean value which allow us to start GUI expanded or not. (collapsed by default)
---
