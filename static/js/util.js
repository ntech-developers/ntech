function shadow_on_scroll(top, scrolled) {
    $(scrolled).on('scroll', function () {
        if ($(this).scrollTop() > 0) {
            $(top).addClass("under-shadow");
        } else {
            $(top).removeClass("under-shadow");
        }
    });
}

function on_input_focused() {
    let parent = $(this).parent();
    parent.find(".placeholder").addClass("placeholder-raised");
    parent.find(".flash").addClass("flash-active");
}

function on_input_altered() {
    let parent = $(this).parent();
    if ($(this).val()) {
        parent.find(".placeholder").addClass("placeholder-raised");
        parent.find(".flash").addClass("flash-active");
    }
}

function on_input_blur() {
    let parent = $(this).parent();
    if (!$(this).val()) {
        parent.find(".placeholder").removeClass("placeholder-raised");
        parent.find(".flash").removeClass("flash-active");
    }
}

function activate_inputs() {
    const inputs = $(".data");
    inputs.on("blur", on_input_blur);
    inputs.change(on_input_altered);
    inputs.on("focus", on_input_focused);
    inputs.on("load", on_input_focused);
    recheck_inputs()
}

function recheck_inputs() {
    $(".data").toArray().forEach((input) => {
        if ($(input).val() !== '' && $(input).val() !== null)
            $(input).parent().find('.placeholder').addClass('placeholder-raised');
    })
}

activate_inputs();