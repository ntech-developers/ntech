function pretty_date(string) {
    return new Date(string).toDateString();
}

function parseTime(string) {
    const exp = /(\d+):(\d+)/g;
    let [hours, minutes] = exp.exec(string).slice(1, 3);
    return `${hours}:${minutes}`;
}

function pruralize(val, string) {
    if (val !== 1) return string + "s";
    return string;
}

function parseDuration(data, raw = false) {
    const milliseconds = to_duration(
        data.start_date, data.start_time,
        data.end_date, data.end_time
    );
    const seconds = milliseconds / 1000;
    if (raw) return seconds;
    if (seconds < 60)
        return pruralize(seconds % 60, `${seconds % 60} sec`);
    else if (seconds < 3600)
        return pruralize(Math.round(seconds % 3600) / 60, `${(Math.round(seconds % 3600) / 60)} min`);
    else if (seconds < 86400)
        return pruralize(Math.round(seconds / 3600), `${Math.round(seconds / 3600)} hr`);
    else if (seconds < 2592000)
        return pruralize(Math.round(seconds / 86400), `${Math.round(seconds / 86400)} day`);
    else if (seconds < 31536000)
        return pruralize(Math.round(seconds / 2592000), `${Math.round(seconds / 2592000)} month`);
    else if (seconds > 31536000)
        return pruralize(Math.round(seconds / 31536000), `${Math.round(seconds / 31536000)} year`);
}


function EventDay(date) {
    'use strict';
    this.events = [];
    this.template = $(`
    <div class="event-collection">
        <div class="duration-strip"></div>
        <div class="event-control">
            <span class="date slight-margin"><i class="ion-ios-calendar blue"></i>&nbsp;${pretty_date(date)}</span>
            <span class="controls slight-margin right">
                <i class="ion-chevron-up round-btn-2 collapse-btn"></i>
            </span>
        </div>
        <div class="event-item-holder"></div>
    </div>`);

    this.template.find('.collapse-btn').click(() => {
        this.template.toggleClass('event-collapsed');
        this.template.find('.collapse-btn').toggleClass('rotated');
    });
    $("#schedule-content").append(this.template);

    this.resize = function () {
        const was_collapsed = this.template.hasClass('event-collapsed');
        if (was_collapsed) this.expand();
        this.template.css('height', 'auto');
        this.template.css('height', this.template.get(0).getBoundingClientRect().height);
        if (was_collapsed) this.collapse();
    };

    this.collapse = function () {
        this.template.addClass('event-collapsed');
        this.template.find('.collapse-btn').addClass('rotated');
    };

    this.expand = function () {
        this.template.removeClass('event-collapsed');
        this.template.find('.collapse-btn').removeClass('rotated');
    };

    this.loadEvent = function (event) {
        this.events.push(event);
        this.template.find(".event-item-holder").append(event.template);
        this.resize();
    };

    this.search = function (value) {
        let search_count = 0;
        for (let event of this.events) {
            if (event.search(value))
                search_count++;
        }
        if (search_count === 0)
            this.template.addClass("condensed");
        else
            this.template.removeClass("condensed");
        this.resize();
        return search_count;
    }

}

function require_text(input, label, error) {
    if (!$(input).val()) {
        $(error).text("Field is required");
        return null;
    } else {
        $(error).text("");
        let data = {};
        data[label] = $(input).val();
        return data
    }
}

function verify_start() {
    const input = $("#start_date"), error = $("#sd-err");
    if (!input.val()) {
        error.text("Field is required");
        return null;
    } else {
        error.text("");
    }
    if (!$("#start_time").val()) {
        $("#st-err").text("Field is required");
        return null;
    } else {
        error.text("");
        return {start_date: input.val(), start_time: $("#start_time").val()};
    }
}

function start_as_date() {
    return new Date([$("#start_date").val(), $("#start_time").val()].join(" "))
}

function end_as_date() {
    return new Date([$("#end_date").val(), $("#end_time").val()].join(" "))
}

function to_duration(start_d, start_t, end_d, end_t) {
    return new Date([end_d, end_t].join(" ")) - new Date([start_d, start_t].join(" "));
}

function verify_end() {
    const input = $("#end_date"), error = $("#ed-err");
    if (!input.val()) {
        error.text("Field is required");
        return null;
    } else if (!$("#end_time").val()) {
        $("#et-err").text("Field is required");
        return null;
    } else if (end_as_date() - start_as_date() < 0) {
        error.text("Event ends earlier than it starts.");
    } else {
        error.text("");
        return {end_date: input.val(), end_time: $("#end_time").val()};
    }
}

function clear(...inputs) {
    for (let input of inputs) {
        $(input).val("")
    }
    activate_inputs();
}

function EventCreator() {
    this.load = function (event = null) {
        $('#new_event').removeClass('hidden');
        clear("#start_time", "#start_date", "#end_date",
            "#end_time", "#description", "#sc-name");
        this.event = null;
        $("#add-event").html("<i class=\"ion-ios-plus-empty\"></i> Add event");
        if (event) {
            $("#add-event").html("<i class=\"ion-android-create\"></i> Edit event");
            this.event = event;
            for (let key in event.data) {
                if (event.data.hasOwnProperty(key)) {
                    const element = document.getElementsByName(key)[0];
                    if (element) element.value = event.data[key];
                }
            }
            activate_inputs();
        }
    };
    this.save = function () {
        const fetch_functions = [
            () => require_text($("#sc-name"), "name", $("#nm-err")),
            verify_start,
            verify_end,
            () => require_text($("#description"), "description", $("#ds-err")),
        ];
        let form_data = {};
        for (let func of fetch_functions) {
            let val = func();
            if (!val) return;
            Object.assign(form_data, val);
        }
        form_data = this.event ? Object.assign({}, this.event.data, form_data) : form_data;
        if (this.event) this.event.willReload();
        $('#new_event').addClass('hidden');
        if (JSON.stringify(form_data) === JSON.stringify(this.event.data)) {
            create_message("There were no changes to update.");
            this.event.reloadFailed();
            return;
        }
        updateEvents(form_data).then((value) => {
                if (value.success) {
                    if (this.event) {
                        this.event.reload(form_data);
                        create_message("The event has been updated successfully.")
                    } else {
                        create_message("The new event has been added successfully.");
                        fetchEvents();
                    }
                } else {
                    this.event.reloadFailed();
                    create_message("We could not update the event. Please retry.", 10, true);
                }
            },
            (value) => {
                this.event.reloadFailed();
                create_message("We could not update the event. Please retry.", 10, true);
            })
    };
    $("#add-event").click(() => this.save());
    $('#add-event-btn').click(() => this.load());
    $('#cancel-event').click(() => $('#new_event').addClass('hidden'));
}

const eventCreator = new EventCreator();

function Event(initial_data, parent) {
    'use strict';
    this.parent = parent;
    initial_data.csrfmiddlewaretoken = csrf;
    this.template = $(`<div class="event-item"></div>`);
    this.edit = function () {
        eventCreator.load(this);
    };
    this.willReload = function () {
        this.template.find(".loader-img").removeClass("hidden");
    };
    this.reloadFailed = function () {
        this.template.find(".loader-img").addClass("hidden");
    };
    this.hide = function () {
        this.template.addClass("condensed");
    };
    this.unhide = function () {
        this.template.removeClass("condensed");
    };
    this.reload = function (data) {
        this.template.find(".loader-img").removeClass("hidden");
        this.data = data;
        data.duration = to_duration(data.start_date, data.start_time, data.end_date, data.end_time);
        let controls = s_auth === 'True' ? `
            <span class="controls slight-margin right">
                <i class="ion-ios-trash round-btn-2 del"></i>
                <i class="ion-android-create round-btn-2 edit"></i>
            </span>
        ` : '';
        let template = $(`
            <div class="duration">
                    <span class="blue"><i class="ion-android-alarm-clock"></i>&nbsp;${parseTime(data.start_time)}&nbsp;</span>
                    <span class="blue force-bottom"><i class="ion-android-alarm-clock"></i>&nbsp;
                        ${parseDuration(data, true) > 86400 ? '<i class="ion-ios-infinite"></i>' : parseTime(data.end_time)}
                    </span>
            </div>
            <div class="event-item-title">
                <span class="title slight-margin force-centre" style="flex-grow: 1;justify-content: left;">
                    <span class="title-data">${data.name}</span>
                    &nbsp;<img class="loader-img hidden" src="/static/images/loaders/tail-spin.svg">
                </span>
                <span class="slight-margin force-centre">${parseDuration(data)}</span>
                ${controls}
            </div>
            <div class="event-item-body ruled desc-data">
                ${data.description}
            </div>
        `);
        template.find(".edit").click(() => this.edit());
        template.find(".del").click(() => this.delete());
        this.template.html("");
        this.template.append(template);
        this.parent.resize();
    };

    this.search = function (val) {
        this.template.find(".title-data").html(this.data.name);
        this.template.find(".desc-data").html(this.data.description);
        let has_match = false;
        if (val) {
            if (this.data.name.match(val)) {
                let title_searched_text = this.data.name.replace(
                    new RegExp(val, "g"),
                    "<font style='background:lightgreen'>$&</font>"
                );
                has_match = true;
                this.template.find(".title-data").html(title_searched_text);
            }
            if (this.data.description.match(val)) {
                let desc_searched_text = this.data.description.replace(
                    new RegExp(val, "g"),
                    "<font style='background:lightgreen'>$&</font>"
                );
                has_match = true;
                this.template.find(".desc-data").html(desc_searched_text);
            }
        } else {
            has_match = true;
        }
        if (!has_match) {
            this.hide()
        } else {
            this.unhide()
        }
        return has_match;
    };

    this.delete = function () {
        prompt("Are you sure you want to delete this event? This operation cannot be undone!").then((value) => {
            if (!value) return;
            this.willReload();
            updateEvents({pk: this.data.pk, del: true}).then(
                () => {
                    this.template.remove();
                    this.parent.events.splice(this.parent.events.indexOf(this), 1);
                    this.parent.resize();
                    create_message("The event has been deleted successfully.", 10);
                },
                () => {
                    this.reloadFailed();
                    create_message("We could not delete the event. Please retry.", 10, true);
                }
            )
        });
    };
    this.reload(initial_data);
}


function groupBy(field, data) {
    const grouped = {};
    for (let entry of data) {
        entry.fields.pk = entry.pk;
        if (entry.fields[field] in grouped) {
            grouped[entry.fields[field]].push(entry.fields);
        } else {
            grouped[entry.fields[field]] = [entry.fields];
        }
    }
    return grouped;
}

function updateEvents(data = {}) {
    data.csrfmiddlewaretoken = csrf;
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            data: data,
            url: "/info/schedule",
            success: function (response) {
                resolve(response)
            },
            error: function () {
                reject(false);
            }
        })
    });
}

let event_collections = [];

function fetchEvents() {
    const previous = $("#schedule-content .event-collection");
    previous.addClass("condensed");
    let loader = set_loader($("#schedule-content"));
    $.ajax({
        type: "GET",
        url: "/info/schedule",
        success: function (response) {
            event_collections = [];
            previous.remove();
            let data = JSON.parse(response.events);
            data = groupBy('start_date', data);
            for (let day in data) {
                if (data.hasOwnProperty(day)) {
                    const event_day = new EventDay(day);
                    event_collections.push(event_day);
                    for (let entry of data[day]) {
                        event_day.loadEvent(new Event(entry, event_day));
                    }
                }
            }
            check_label();
            loader.remove();
        },
        error: function () {
            loader.remove();
            previous.removeClass("condensed");
            create_message("Something went wrong while fetching Schedule!", 10, true);
        }
    })
}

fetchEvents();

function collapse_all() {
    for (let event_day of event_collections) {
        event_day.collapse();
    }
}

function expand_all() {
    for (let event_day of event_collections) {
        event_day.expand();
    }
}

let no_result;

function search() {
    if (no_result) no_result.remove();
    const val = $(this).val();
    let search_count = 0;
    for (let event_day of event_collections) {
        search_count += event_day.search(val);
    }
    if (search_count === 0) {
        no_result = set_no_result($("#schedule-content"));
    }
}

function check_label() {
    let offset = $("#schedule-content").offset().top;
    const smooth_offset = 40;
    for (let child of $("#schedule-content").find(".event-collection")) {
        const rect = child.getBoundingClientRect();
        if ((rect.y - offset + rect.height + smooth_offset) > 0) {
            $("#schedule-current").find("span").text($(child).find(".date").text());
            break;
        }
    }
}

$("#schedule-content").scroll(check_label);
$("#refresh").click(fetchEvents);
$("#collapse").click(collapse_all);
$("#expand").click(expand_all);
$("#search").keyup(search);
$("#search").blur(search);