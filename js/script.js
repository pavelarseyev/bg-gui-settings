import GUISettings from "./GUI-settings.js";

const someFeed1 = [{Odds: {value: '1x'} }, {Odds: {value: '2x'}}];
const someFeed2 = [{Odds: {value: '3x'} }, {Odds: {value: '4x'}}];

const Widget = {
  properties: {
    widgetFeed: {
      data: [someFeed1, someFeed2]
    },
    widgetFont: {
      id: 'Montserrat'
    },
    stringField: 'Some text in the field',
    numberField: 103,
    booleanField: true,
    listField: ['option 1', 'option 2', 'option 3'],
    colorField1: '#ff33ee',
    colorField2: 'rgba(0,0,0, 1)'
  },
};

const table = document.getElementById('table');

new GUISettings(Widget, async () => {
  console.log('propertyChanged');

  callback(Widget.properties);


  await Widget.properties.widgetFont.createFontFace('some text');
  
  const feed = await Widget.properties.widgetFeed.load();

  console.log(Widget)
}, {
  expanded: true,
  widgetWrapper: document.querySelector('.wrapper')
});





function callback (settings) {
  let html = '';

  Object.keys(settings).forEach((key, i) => {
    const row = document.createElement('tr');
    const th = document.createElement('th');
    const td = document.createElement('td');

    th.innerText = key;

    if (settings[key]?.id) {
      td.innerText = settings[key].id;
    } else if (settings[key]?.data || settings[key].data === null) {
      const input = document.querySelector(`[name="${key}"]:checked`);
      td.innerText = input ? input.id : 'Feed not selected';
    } else {
      td.innerText = settings[key];
    }
    

    [th, td].forEach(item => row.appendChild(item));
    html += row.outerHTML;
  });

  table.querySelector('tbody').innerHTML = html;
}

