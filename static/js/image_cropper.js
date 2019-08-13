let image_cropper = {
    pressed: false,
    pos: {x: 0, y: 0},
    floating_pos: {x: 0, y: 0},
    events_bound: false,
    prev_source: "blank.gif",
    prev_aspect_ratio: 1,
    prev: {x: 0, y: 0, width: 180, height: 180, src: 'blank.gif', ratio: 1, file: null},
    image: undefined,
    file: undefined,
    reload_prev: function () {
        this.aspect_ratio = this.prev.ratio;
        this.resize(this.prev.width, null, true);
        this.floating_pos = {x: this.prev.x, y: this.prev.y};
        this.pos = {x: this.prev.x, y: this.prev.y};
        this.reposition(true);
        this.image.src = this.prev.src;
        this.file = this.prev.file;
        this.document.getElementById("img-upload").files = this.file;
    },
    reposition: function (correction = false) {
        if (!correction) {
            this.image.style.left = `${this.floating_pos.x}px`;
            this.image.style.top = `${this.floating_pos.y}px`;
        } else {
            if (this.image.width + this.pos.x < 180) {
                this.pos.x = this.pos.x + (180 - this.image.width + this.pos.x);
                this.floating_pos.x = this.pos.x;
            }
            if (this.image.height + this.pos.y < 180) {
                this.pos.y = this.pos.y + (180 - this.image.height + this.pos.y);
                this.floating_pos.y = this.pos.y;
            }
            this.reposition();
        }
    },
    on_drag: function (event) {
        if (this.pressed) {
            let x = event.clientX - this.pressed.x, y = event.clientY - this.pressed.y;
            if (this.pos.x + x <= 0 && this.image.width + this.pos.x + x >= 180)
                this.floating_pos.x = this.pos.x + x;
            if (this.pos.y + y <= 0 && this.image.height + this.pos.y + y >= 180)
                this.floating_pos.y = this.pos.y + y;
            this.reposition();
        }
        event.preventDefault();
    },
    drag_start: function (event) {
        this.image.style.cursor = "grabbing";
        this.pressed = {x: event.clientX, y: event.clientY};
    },
    drag_end: function () {
        this.image.style.cursor = "grab";
        this.pressed = false;
        this.pos.x = this.floating_pos.x;
        this.pos.y = this.floating_pos.y;
    },
    on_enter: function () {
        this.image.style.cursor = "grab";
    },
    width: function () {

    },
    reset: function () {
        this.aspect_ratio = 1;
        this.resize(180, null, true);
        this.floating_pos = {x: 0, y: 0};
        this.reposition()
    },
    initialize: function (image) {
        this.image = document.getElementById(image);
        this.image.onload = null;
        //this.reset();
        if (!this.events_bound) {
            this.image.addEventListener("mousedown", (event) => this.dispatch("drag_start", event));
            this.image.addEventListener("mousemove", (event) => this.dispatch("on_drag", event));
            this.image.addEventListener("mouseup", (event) => this.dispatch("drag_end", event));
            this.image.addEventListener("mouseleave", (event) => this.dispatch("drag_end", event));
            this.image.addEventListener("mouseenter", (event) => this.dispatch("on_enter", event));
        }
        this.initialized = true;
        this.aspect_ratio = this.image.naturalHeight / this.image.naturalWidth;
        this.styling();
        this.is_zoomed = false;
        this.events_bound = true;
        this.touch_handler = new Touch(this.image);
        this.touch_handler.on_drag = (ev) => {
            this.on_drag(ev)
        };
        this.touch_handler.on_start = (ev) => {
            this.drag_start(ev)
        };
        this.touch_handler.on_end = (ev) => {
            this.drag_end(ev)
        };
        this.touch_handler.on_zoom = (delta) => {
            this.on_pinch_zoom(delta)
        };
        this.touch_handler.on_double_tap = () => {
            this.on_double_tap()
        };
    },
    dispatch: function (callback, event) {
        if (this.initialized) {
            this[callback](event);
        }
    },
    resize: function (width, height = null, force = false) {
        if (!height && ((width > 200 && width * this.aspect_ratio > 200) || force)) {
            this.image.style.width = `${width}px`;
            this.image.style.height = `${width * this.aspect_ratio}px`;
        } else if ((height > 200 && height * 1 / (this.aspect_ratio) > 200) || force) {
            this.image.style.height = `${height}px`;
            this.image.style.width = `${height * 1 / (this.aspect_ratio)}px`;
        }
    },
    zoom_in: function () {
        this.resize(this.image.width + 30);
        this.is_zoomed = true;
    },
    zoom_out: function () {
        this.resize(this.image.width - 30);
    },
    on_pinch_zoom: function (delta) {
        this.resize(this.image.width + delta);
        this.is_zoomed = true;
    },
    on_double_tap: function () {
        if (!this.is_zoomed) {
            this.resize(this.image.width + 100);
            this.is_zoomed = true;
        } else {
            this.reset_size();
            this.is_zoomed = false;
        }
    },
    styling: function () {
        $("#zoom-in,#zoom-out,#finish-upload,#cancel-crop,#bin").removeClass("center-pos");
        $("#upload-btn").toggleClass("ion-camera");
        if (!this.events_bound) {
            $("#zoom-in").click((event) => this.zoom_in(event));
            $("#zoom-out").click((event) => this.zoom_out(event));
            $("#finish-upload").click(() => this.finalize());
        }
        this.image.style.cursor = "grab";
        this.reset_size();
    },
    reset_size: function () {
        if (this.aspect_ratio < 1) {
            this.resize(null, 250);
        } else {
            this.resize(250);
        }
    },
    finalize: function (cancel = false) {
        if (!this.image || !this.file)
            $("#zoom-in,#zoom-out,#finish-upload").addClass("center-pos");
        this.initialized = false;
        this.image.style.cursor = "default";
        if (cancel) {
            this.reload_prev();
            return;
        }
        this.file = document.getElementById("img-upload").files[0];
        this.prev = {
            x: this.pos.x,
            y: this.pos.y,
            ratio: this.aspect_ratio,
            width: this.image.width,
            src: this.image.src,
            file: this.file,
        };
        let data = new FormData();
        data.append("image", this.file);
        data.append("x", Math.abs(this.pos.x));
        data.append("y", Math.abs(this.pos.y));
        data.append("width", this.image.width);
        data.append("height", this.image.height);
        data.append("side_len", "180");
        data.append("csrfmiddlewaretoken", document.getElementsByName("csrfmiddlewaretoken")[0].value);
        upload_image(data, this.image);
    }
};

$("#cancel-crop").click(() => {
    $("#image-crop-popup").addClass("hidden");
});
$("#update-profile").click(() => {
    $("#image-crop-popup").removeClass("hidden");
    if (image_cropper.file) {
        image_cropper.initialize("uploaded-img");
    }
});

function read_file(event, input, output, callback = function () {
    image_cropper.initialize("uploaded-img")
}) {
    output = document.getElementById(output);
    image_cropper.prev.src = output.src;
    let reader = new FileReader();
    reader.onload = () => {
        output.src = reader.result;
    };
    reader.readAsDataURL(input.files[0]);
    output.onload = () => callback();
}

function upload_image(data, image) {
    $("#image-loader").removeClass("invisible");
    $.ajax({
        type: 'POST',
        url: '/accounts/profile/image',
        data: data,
        processData: false,
        contentType: false,
        success: function (data) {
            $("#image-loader").addClass("invisible");
            $("#image-crop-popup").addClass("hidden");
            create_message("Your profile image has been changed successfully.", 8);
            $(".user-img").attr("src", data.src[0])
        },
        error: function () {
            console.log("image upload failed");
            $("#image-loader").addClass("invisible");
            $("#image-crop-popup").addClass("hidden");
            create_message("We could not update your profile image. Please retry", 10, true);
        }
    });
}