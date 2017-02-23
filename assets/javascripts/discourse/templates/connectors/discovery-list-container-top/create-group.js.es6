import {ajax} from 'discourse/lib/ajax';
import {popupAjaxError} from 'discourse/lib/ajax-error';
import {withPluginApi} from 'discourse/lib/plugin-api';


// For debugging
function log() {
  console.log.apply(console, arguments);
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
  $containerEl.find('button').on('click', onCreateGroupClicked.bind(null, $containerEl));
  $containerEl.show();
}

function hide($containerEl) {
  log('group:hide');
  $containerEl.hide();
  $containerEl.find('button').off('click');
}


function onCreateGroupClicked($containerEl, e) {
  log('group:onCreateGroupClicked');
  // Read data from the form
  var formData = {
    name: $containerEl.find('.name').val(),
    description: $containerEl.find('.description').val(),
    color: '0000ff',
    text_color: 'ff0000',
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
}

function navigateToCategory(json) {
  window.location = json.category_url;
}


// It would be great if outlets had a full lifecycle API, but this
// will be called when the outlet is rendered.
export default {setupComponent}