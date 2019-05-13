function Waypoint(ref) {
    this.ref = ref;
    this.elements = [];
    let self = this;
    let is_within = function (element) {
        return element.elem.getBoundingClientRect().y - self.ref.getBoundingClientRect().y + element.offset <= self.ref.getBoundingClientRect().y + self.ref.getBoundingClientRect().height;
    };

    let bottom_reached = function () {
        return self.ref.scrollTop + self.ref.getBoundingClientRect().height >= self.ref.scrollHeight;
    };
    let onScroll = function () {
        self.elements.forEach(function (element) {
            if ((!element.triggered) && (is_within(element) || bottom_reached())) {
                element.handler(element.elem);
                element.triggered = true;
            }
        })
    };
    this.add = function (o) {
        o.triggered = false;
        self.elements.push(o);
    };
    this.init = function () {
        onScroll();
    };
    this.ref.addEventListener("scroll", onScroll)
}

let wayPtMgr = new Waypoint(document.getElementsByClassName("content")[0]);

$(".waypoint").toArray().forEach(function (child) {
    wayPtMgr.add({
        elem: $(child).get(0),
        offset: 200,
        handler: function (element) {
            $(element).removeClass("slide-up");
            $(element).addClass("slide-up");
        }
    });
});

let total_delay = 0;

$(".waypoint-side").toArray().forEach(function (child) {
    wayPtMgr.add({
        elem: $(child).get(0),
        offset: 200,
        handler: function (element) {
            setTimeout(function () {
                $(element).removeClass("slide-right");
                $(element).addClass("slide-right");
            }, total_delay);
            total_delay += 100;
            total_delay = $(element).hasClass("terminate") ? 0 : total_delay;
        }
    });
});

wayPtMgr.init();  //Keep this as the last line