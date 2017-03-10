import {ajax} from 'discourse/lib/ajax';
import {popupAjaxError} from 'discourse/lib/ajax-error';
import {withPluginApi} from 'discourse/lib/plugin-api';



// For debugging
function log() {
  // console.log.apply(console, arguments);
}


function setupComponent(args, component) {
  log('group:setupComponent');
  withPluginApi('0.1', api => api.onPageChange(onPageChange));
}


// Check whether we should show the form or not, and add the click handler
function onPageChange(url, title) {
  const $containerEl = $('#create-group-form-container');
  const learnerGroupsCategoryName = Discourse.SiteSettings.learner_groups_category_name;
  const learnerGroupsUrl = `/c/${learnerGroupsCategoryName.toLowerCase()}`;

  if (url === learnerGroupsUrl) {
    show($containerEl);
  } else {
    hide($containerEl);
  }
}

function show($containerEl) {
  log('group:show');
  setupColorPicker($containerEl.find('input.color'));
  $containerEl.find('button').on('click', onCreateGroupClicked.bind(null, $containerEl));
  $containerEl.show();
}

function hide($containerEl) {
  log('group:hide');
  $containerEl.hide();
  $containerEl.find('button').off('click');
}



const grayColors = ["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"];
const standardColors = ["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"];
const extraColors = [
  ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
  ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
  ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
  ["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
  ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
  ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
];
const palette = [grayColors, standardColors].concat(extraColors);


// This relies on two files from http://bgrins.github.io/spectrum/ being bundled
// in the JS and CSS.
function setupColorPicker($colorPickerEl) {
  // Random initial color from extraColors.
  const colorsInRow = extraColors[Math.floor(Math.random() * extraColors.length)];
  const initialColor = colorsInRow[Math.floor(Math.random() * colorsInRow.length)];

  $colorPickerEl.spectrum({
    color: initialColor,
    palette: palette,
    containerClassName: 'group-color-picker-container',
    replacerClassName: 'group-color-picker-replacer',

    // Color picker, not change or comparison
    showInput: false,
    showInitial: false,
    showAlpha: false,
    allowEmpty: false,
    preferredFormat: 'hex',
    
    // Click/tap-based, no text and no buttons
    hideAfterPaletteSelect: true,
    clickoutFiresChange: true,
    showButtons: false,

    // Show palette, with more colors
    showPalette: true,
    showPaletteOnly: false,
    togglePaletteOnly: true,
    togglePaletteMoreText: 'more',
    togglePaletteLessText: 'less',

    // Don't store selections in palette
    showSelectionPalette: false,
    selectionPalette: [],
    maxSelectionSize: 0
  });
}

function onCreateGroupClicked($containerEl, e) {
  log('group:onCreateGroupClicked');
  // Read data from the form
  const color = $containerEl.find('.color').spectrum('get').toHex();
  const formData = {
    name: $containerEl.find('.name').val(),
    description: $containerEl.find('.description').val(),
    color: color,
    text_color: '000000',
    csrf: $('meta[name="csrf-token"]').attr('content')
  };

  // Disable the form, make the request, and navigate to the new
  // category or show an error
  log('ajax', formData)
  setFormEnabled($containerEl, false);
  ajax('/category/group', { type: 'POST', data: formData })
    .then(navigateToCategory)
    .catch(popupAjaxError)
    .catch(() => setFormEnabled($containerEl, true))
}


function setFormEnabled($containerEl, isEnabled) {
  $containerEl.find('input,button').attr('disabled', !isEnabled);
  $containerEl.find('input.color').spectrum({ disabled: !isEnabled });
}

function navigateToCategory(json) {
  window.location = json.category_url;
}


// It would be great if outlets had a full lifecycle API, but this
// will be called when the outlet is rendered.
export default {setupComponent}