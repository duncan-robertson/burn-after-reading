/* global $ */

$(document).ready(() => {
  $('#encrypt').click(() => {
    var errorbox = $('#error')
    errorbox.html = ''
    $.post('/encrypt', {text: $('#message').val()})
    .done((result) => {
      if (result.success) {
        $('#id').val(result.id)
        $('#key').val(result.key)
        $('#count').val(result.count)
        $('#sharable').val(window.location + result.id + '?key=' + result.key + '&count=' + result.count)
      } else {
        errorbox.html('An error occurred, try again')
      }
      $('#encrypt').blur()
    })
  })
})
