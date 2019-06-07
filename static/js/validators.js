/*
* Copyright 2019 Ntech developers
* This code contains all validations carried out for data to and fro the backend
* All form validations are found here
*/

//dependencies : jquery, jquery-dajax, util.js

const CheckList = {
    first_name: false,
    last_name: false,
    mobile: false,
    password1: false,
    password2: false,
    gender: true,
    country: true,
    institution: false,
    new_institution: false,
    date_of_birth: false,
};

const AsyncChecklist = {
    // Validations that carried out instantaneously e.g. ajax validations
    // Ensure the values are always a promises!
    email: new Promise((resolve) => resolve(false)),
    username: new Promise((resolve) => resolve(false)),
};

const Initial = {
    username: null,
    email: null,
};

function calculate_strength() {
    const strength = password_strength($(this).val()).toString();
    document.getElementById("strength-bar").style.width = strength + "%";
    $("#strength-val").text(strength + " %")
}

const password_input = $("#password");
password_input.keyup(calculate_strength);
password_input.change(calculate_strength);

$("#institution").change(function () {
    if ($(this).val() === "") {
        $("#ot-err").text("");
        $("#new_institution").prop("disabled", false);
    } else {
        $("#new_institution").prop("disabled", true);
    }
});

function calculate_age(birthday) {
    // birthday is a date
    let ageDifMs = Date.now() - birthday.getTime();
    let ageDate = new Date(ageDifMs);
    // milliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

$("#date_of_birth").change(function () {
    let dob = new Date($(this).val());
    if (dob) {
        $("#age-val").find("span").text(calculate_age(dob));
    } else {
        //do something for invalid date
    }
});

let selected = [];
$("#skill-select").change(function () {
    console.log("skill");
    if (selected.indexOf($(this).val().trim()) < 0 && $(this).val().trim().toLowerCase() !== "select skill") {
        let value = $(this).val().trim();
        let input = $("#skill");
        let tag = $(`<span class='tag small-description'>${value}&nbsp;<i class="ion-ios-close-empty"></i> </span>`);
        $("#skill-tags").append(tag);
        selected.push(value);
        input.val(selected.join(","));
        tag.find("i").click(function () {
            selected.splice(selected.indexOf(value), 1);
            tag.remove();
            input.val(selected.join(","));
        })
    }
});

function activate_tags() {
    const input = $("#skill");
    selected = input.val() ? input.val().split(",") : [];
    selected.forEach(function (value) {
        let tag = $(`<span class='tag small-description'>${value}&nbsp;<i class="ion-ios-close-empty"></i> </span>`);
        $("#skill-tags").append(tag);
        tag.find("i").click(function () {
            selected.splice(selected.indexOf(value), 1);
            tag.remove();
            input.val(selected.join(","));
        })
    })
}


function is_email_taken(email) {
    AsyncChecklist.email = new Promise((resolve) => {
        if (email === "") {
            $("#em-err").text("This field cannot be empty");
            resolve(false);
        } else {
            $("#em-err").text("");
            $.ajax({
                type: "GET",
                url: "/accounts/email/verify",
                data: {"email": email},
                success: function (response) {
                    if (response["exists"] && Initial.email !== email) {
                        resolve(false);
                        $("#em-err").text("This email is taken");
                    } else {
                        resolve(true);
                        $("#em-err").text("");
                    }
                    $("#email").parent().removeClass("load-mode");
                },
                error: function () {
                    resolve(false);
                    $("#em-err").text("Failed to authenticate. Check your connection.");
                    $("#email").parent().removeClass("load-mode");
                }
            })
        }
    });
}

function is_username_taken(username) {
    AsyncChecklist.username = new Promise((resolve) => {
        if (username === "") {
            $("#un-err").text("This field cannot be empty");
            resolve(false);
        } else {
            $("#un-err").text("");
            $("#username").parent().addClass("load-mode");
            $.ajax({
                type: "GET",
                url: "/accounts/username/verify",
                data: {"username": username},
                success: function (response) {
                    if (response["exists"] && Initial.username !== username) {
                        resolve(false);
                        $("#un-err").text("This username is taken");
                    } else {
                        resolve(true);
                        $("#un-err").text("");
                    }
                    $("#username").parent().removeClass("load-mode");
                },
                error: function () {
                    resolve(false);
                    $("#username").parent().removeClass("load-mode");
                }
            })
        }
    });
}

function matches(input_1, input_2) {
    return $(input_1).val().toString().startsWith($(input_2).val())
}


function compare_password(ev = null, strict = false) {
    /*
    * The strict parameter is set to true when the user is typing through
    * the keyup event hence hides the error message as long as the user's
    * input is so far correct at the point of keying.
    */
    if (!$("#password2").val()) {
        $("#pw2-err").text("This field cannot be empty");
        CheckList.password2 = false;
    } else if (matches($("#password"), $("#password2")) && !strict) {
        $("#pw2-err").text("");
    } else if (strict && ($("#password").val() === $("#password2").val())) {
        $("#pw2-err").text("");
        CheckList.password2 = true;
    } else {
        $("#pw2-err").text("The password entered does not match");
        CheckList.password2 = false;
    }
}

function field_is_required(field, error, condition = null) {
    $(field).on("blur keyup change", function () {
        if (condition !== null && !condition()) {
            $(error).text("");
            CheckList[$(this).attr("name")] = true;
            return
        }
        if ($(this).val().toString() === "") {
            CheckList[$(this).attr("name")] = false;
            $(error).text("This field cannot be empty");
        } else {
            $(error).text("");
            CheckList[$(this).attr("name")] = true;
        }
    })
}

function NumericValidator(value) {
    if (!isNaN(value)) {
        return "Password is entirely numeric"
    }
}

const PASSWORD_MIN_LENGTH = 8;

function LengthValidator(value) {
    if (value.length < PASSWORD_MIN_LENGTH) {
        return "Password is too short"
    }
}

const validators = [NumericValidator, LengthValidator];

function validate_password(field, error, confirm_field = null) {
    $(field).on("change blur keyup", function () {
        $(error).text("");
        if (confirm_field)
            $(confirm_field).trigger("blur");
        if ($(field).val() === "") {
            $(error).text("This field cannot be empty");
            CheckList[$(field).attr("name")] = false;
            return;
        }
        let errors = [];
        let value = $(field).val();
        validators.map((validator) => {
            let val = validator(value);
            if (val)
                errors.push(val)
        });
        $(error).text(errors.join(", "));
        CheckList[$(field).attr("name")] = !errors.length;
    })
}

function submit(event, on_valid = null) {
    event.preventDefault(1);
    $("input").trigger("blur"); // Force validations to be carried out by the inputs
    $(this).find(".loader-img").removeClass("hidden");
    let failed = false;
    let fail_location = [];
    for (let key in CheckList) {
        if (CheckList.hasOwnProperty(key)) {
            if (!CheckList[key]) {
                failed = true;
                fail_location.push(document.getElementsByName(key)[0]);
            }
        }
    }
    AsyncChecklist.username.then((value) => {
        if (!value) {
            failed = true;
            fail_location.push(document.getElementsByName("username")[0]);
        }
        AsyncChecklist.email.then((val) => {
            if (!val) {
                failed = true;
                fail_location.push(document.getElementsByName("email")[0]);
            }

            if (failed && fail_location[0]) {
                fail_location[0].scrollIntoView({behavior: "smooth", block: "center"});
            } else {
                if (on_valid)
                    on_valid();
                else
                    $("#submit").trigger("click");
            }
            $(event.target).find(".loader-img").addClass("hidden");
        })
    });
}

function institution_validation() {
    let institution = $("#institution");
    let other = $("#new_institution");
    if (institution.val() === "") {
        CheckList.institution = true;
        if (!other.val()) {
            $("#ot-err").text("This field cannot be empty");
            CheckList.new_institution = false;
        } else {
            $("#ot-err").text("");
            CheckList.new_institution = true;
        }
    } else {
        $("#ot-err").text("");
        CheckList.new_institution = true;
        CheckList.institution = true;
    }
}

$("#pre-submit").click(submit);
$("#username").blur(function () {
    is_username_taken($(this).val())
});
$("#email").blur(function () {
    is_email_taken($(this).val())
});
$("#password2").blur(() => compare_password(null, true));
$("#password2").keyup(compare_password);
$("#new_institution").on("blur keyup", institution_validation);
field_is_required($("#first_name"), $("#fn-err"));
field_is_required($("#mobile"), $("#mb-err"));
validate_password($("#password"), $("#pw-err"), $("#password2"));
field_is_required($("#date_of_birth"), $("#dob-err"));
field_is_required($("#last_name"), $("#ln-err"));
field_is_required($("#gender"), $("#gn-err"));
field_is_required($("#country"), $("#ct-err"));
field_is_required($("#email"), $("#em-err"));

// =================================== login validators ==================================

const csrf = document.getElementsByName("csrfmiddlewaretoken")[0].value;

function pre_authenticate() {
    if (!$("#id_password").val() || !$("#id_username").val()) return;
    $("#id_password").parent().addClass("load-mode"); // start loader
    $(".error").text(""); // Clear existing errors
    $.ajax({
        type: "POST",
        url: "/accounts/preauth",
        data: {"username": $("#id_username").val(), "password": $("#id_password").val(), "csrfmiddlewaretoken": csrf},
        success: function (response) {
            switch (response.status) {
                case 0:
                    $("#sign_in").trigger("click");
                    break;
                case 1:
                    $("#lpw-err").text("The password entered is incorrect");
                    break;
                case 2:
                    $("#lun-err").text("This username does not exists");
            }
            $("#id_password").parent().removeClass("load-mode"); // quit loader
        },
        error: function () {
            $("#lpw-err").text("Failed to authenticate. Check your connection.");
            $("#id_password").parent().removeClass("load-mode");
        }
    })
}

field_is_required($("#id_username"), $("#lun-err"));
field_is_required($("#id_password"), $("#lpw-err"));
$("#pre-submit").click(pre_authenticate);

// =============================== user info update ======================================

$("#update_info").click(() => {
    $("#floating-form").removeClass("hidden")
});
$("#cancel_update").click(function () {
    $("#floating-form").addClass("hidden");
});

$("#submit-update").click(function (event) {
    event.preventDefault();
    update_info(event);
});

function update_info(event) {
    event.preventDefault();
    CheckList.password1 = true;
    CheckList.password2 = true;
    event.target = this;
    submit(event, update);
}

function update() {
    const form = $("#update-form");
    $.ajax({
        type: "POST",
        url: "/accounts/profile/",
        data: form.serialize(),
        success: function (response) {
            if (response['successful']) {
                location.reload();
            } else {
                const errors = $(response.error);
                form.prepend($(response.error));
                errors.get(0).scrollIntoView({behavior: "smooth"});
            }
        },
        error: function () {
            console.log("failed to connect");
        }
    })
}