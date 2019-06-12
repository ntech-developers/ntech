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
            $(input).trigger('change');
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
    dropdowns.parent().find(".select-val i").removeClass("rotated");
}

function toggle_dropdown() {
    if (!($(this).parent().find(".select").hasClass("select-visible"))) {
        hide_all_dropdowns();
    }
    $(this).parent().find(".select").toggleClass("select-visible");
    $(this).find("i").toggleClass("rotated");
}

function activate_drop_downs() {
    $(".select-layer").toArray().forEach(function (select) {
        let value = $(`<div class="select-val"><span></span> &nbsp;<i class="ion-chevron-down"></i></div>`);
        let options = $(`<div class='select'></div>`);
        let input = $(select).find("select");
        input.trigger("change");
        $(value).on("click", toggle_dropdown);
        $(select).append(value, options);
        value.find("span").text(input.get(0)[input.get(0).selectedIndex].innerHTML);
        $(input).children().toArray().forEach(function (option) {
            let opt = $(`<span class="option">${option.innerHTML}</span>`);
            options.append(opt);
            opt.click(function () {
                $(input).val(option.value);
                value.find("span").text(option.innerHTML);
                input.trigger("change");
                hide_all_dropdowns();
            });
        });
        $(select).on("blur", (function () {
            hide_dropdown(options);
        }));
    })
}

$("#menu-btn").click(function () {
    $(this).find("i").toggleClass("ion-android-menu");
    $(this).find("i").toggleClass("ion-android-close");
    $(".overlay").toggleClass("invisible");
    $("#menu-list").toggleClass("hidden");
});


activate_drop_downs();
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

function NoteBook(tab_structure) {
    this.structure = $(tab_structure);
    this.selected = null;
    this.slipper = $(`<div class="slipper"></div>`);
    this.structure.find(".tab-nav").append(this.slipper);
    $(".nav-item").click((event) => this.select(event));
    this.select = function (event) {
        const left = event.target.offsetLeft;
        const width = event.target.getBoundingClientRect().width;
        const slipper = this.slipper.get(0);
        slipper.style.width = `${width}px`;
        slipper.style.left = `${left}px`;
        if (this.selected)
            this.selected.removeClass("tab-selected");
        this.selected = $(`#_${event.target.id}`);
        this.selected.addClass("tab-selected");
    };
    this.select({target: this.structure.find(".tab-nav").children().get(0)});

}

const messenger = $("#messenger");
$("#messenger i").click(() => {
    messenger.addClass("condensed")
});

function create_message(message, delay = 8) {
    messenger.find("span").text(message);
    messenger.removeClass("condensed");
    setTimeout(() => messenger.addClass("condensed"), delay * 1000);
}