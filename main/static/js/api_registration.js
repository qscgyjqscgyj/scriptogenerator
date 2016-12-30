$(function() {
    var BUTTON_SELECTOR = '.macros-button';
    $(document).on('click', BUTTON_SELECTOR, function(e) {
        var button = $(e.target);
        var form = button.closest('form');
        var data = {firs_name: '', email: '', phone: ''};

        form.find('.field').map(function(i, field) {
            field = $(field);
            data[field.attr('data-type')] = field.find('input').attr('value');
        });

        var request = 'https://scriptogenerator.ru/api/ext.register/';
        request = request + '?first_name=' + data.firs_name + '&email=' + data.email + '&phone=' + data.phone;
        request = encodeURI(request);
        alert(request);
        // $('<img src="' + request + '"/>');
    });
});