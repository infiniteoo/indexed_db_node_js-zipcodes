$(document).ready(function () {
  // inspired by http://jsfiddle.net/arunpjohny/564Lxosz/1/
  $('.table-responsive-stack').each(function (i) {
    const id = $(this).attr('id')
    // alert(id);
    $(this).find('th').each(function (i) {
      $('#' + id + ' td:nth-child(' + (i + 1) + ')').prepend('<span class="table-responsive-stack-thead">' + $(this).text() + ':</span> ')
      $('.table-responsive-stack-thead').hide()
    })
  })

  $('.table-responsive-stack').each(function () {
    const thCount = $(this).find('th').length
    const rowGrow = 100 / thCount + '%'
    // console.log(rowGrow);
    $(this).find('th, td').css('flex-basis', rowGrow)
  })

  function flexTable () {
    if ($(window).width() < 768) {
      $('.table-responsive-stack').each(function (i) {
        $(this).find('.table-responsive-stack-thead').show()
        $(this).find('thead').hide()
      })

    // window is less than 768px
    } else {
      $('.table-responsive-stack').each(function (i) {
        $(this).find('.table-responsive-stack-thead').hide()
        $(this).find('thead').show()
      })
    }
    // flextable
  }

  flexTable()

  window.onresize = function (event) {
    flexTable()
  }

  // document ready
})
