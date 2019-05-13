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

function show_dropdown() {
    $(this).siblings().find(".select").addClass("select-visible");
    $(this).find("i").removeClass("ion-chevron-down");
    $(this).find("i").addClass("ion-chevron-up");
}

function hide_dropdown(dropdown) {
    dropdown.removeClass("select-visible");
    dropdown.parent().find(".select-val i").removeClass("rotated");
}

function hide_all_dropdowns() {
    const dropdowns = $(".select");
    dropdowns.removeClass("select-visible");
    dropdowns.find("i").removeClass("rotated");
}

function toggle_dropdown() {
    if (!($(this).parent().find(".select").hasClass("select-visible"))) {
        hide_all_dropdowns();
    }
    $(this).parent().find(".select").toggleClass("select-visible");
    $(this).find("i").toggleClass("rotated");
}

function activate_dropdowns() {
    let dropdowns = $(".select-val");
    dropdowns.on("click", toggle_dropdown);
    $(".select-layer").on("blur", (function () {
        hide_dropdown($(this).find(".select"))
    }));
    $(".select .option").click(function () {
        $(this).parent().parent().find(".select-val span").text($(this).text());
        // ".value-point" is the element in the custom select cluster that holds the select value
        $(this).parent().parent().find(".value-point").val($(this).text());
        $(this).parent().parent().find(".value-point").trigger("change");
        hide_all_dropdowns();
    })
}

$("#menu-btn").click(function () {
    $(this).find("i").toggleClass("ion-android-menu");
    $(this).find("i").toggleClass("ion-android-close");
    $(".overlay").toggleClass("hidden");
});


activate_dropdowns();
activate_inputs();

function uniqueness(string) {
    // determines how unique a string is. A fully unique string will return a value of 1.
    string = string.toString().toLowerCase();
    let unique = "";
    for (let i = 0; i < string.length; i++) {
        if (unique.indexOf(string[i]) < 0) {
            unique += string[i];
        }
    }
    return unique.length / string.length;
}

function password_strength(password_str) {
    // returns password strength as a percentage
    let strength = 0;
    if (password_str.length === 0)
        return strength;
    if (password_str.replace(/\d/g, "") !== password_str)
        strength += 10;
    if (password_str.toLowerCase() !== password_str)
        strength += 10;
    if (password_str.replace(/\W/g, "") !== password_str)
        strength += 10;
    strength += Math.round(40 * password_str.substring(0, 10).length / 10);
    strength += Math.round(30 * uniqueness(password_str));
    return strength;
}