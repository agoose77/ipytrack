var widgets = require('@jupyter-widgets/base');
var _ = require('lodash');
var headtrackr = require('./headtrackr')

var HeadTrackrModel = widgets.DOMWidgetModel.extend({
    defaults: _.extend({}, widgets.DOMWidgetModel.prototype.defaults, {
        _model_name : 'HeadTrackrModel',
        _view_name : 'HeadTrackrView',
        _model_module : 'jupyter-track',
        _view_module : 'jupyter-track',
        scale: 1,
        head_x: 0, head_y: 0, head_z: 0,
        head: [0, 0, 0],
        stream: null,
        scales: [0, 0, 0],
        offset: [0, 0, 0]
    }),
    initialize: function() {
        HeadTrackrModel.__super__.initialize.apply(this, arguments);
        this.video = document.createElement('video')
        this.video.setAttribute('autoplay', '')

        this.canvas = document.createElement( 'canvas' );
        this.canvas.setAttribute("width", "320")
        this.canvas.setAttribute("height", "240")
        this.canvas.setAttribute("style", "display: none;")

        this.canvas_debug = document.createElement( 'canvas' );
        this.canvas_debug.setAttribute("width", "320")
        this.canvas_debug.setAttribute("height", "240")
        this.canvas_debug.setAttribute("style", "display: inline;")


        this.get('stream').stream.then((stream) => {
            console.log('ok, got stream')
            window.last_tracker = this;
            this.video.srcObject = stream;
            this.video.play()
            this.tracker = new headtrackr.Tracker({smoothing: true,debug: this.canvas_debug, altVideo : {ogv : "./media/capture5.ogv", mp4 : "./media/capture5.mp4"}});
            this.tracker.init(this.video, this.canvas, true);
            this.tracker.start();
        })
        this.on('msg:custom', _.bind(this.custom_msg, this));
        document.addEventListener("headtrackingEvent", (e) => {
            var s = this.get('scale')
            var scales = this.get('scales')
            var offset = this.get('offset');
            var x = e.x * s * scales[0] + offset[0];
            var y = e.y * s * scales[1] + offset[1];
            var z = e.z * s * scales[2] + offset[2];
            this.set({head_x: x, head_y: y, head_z: z, head: [x, y, z]})
            this.save_changes()
        })

    },
    custom_msg: function(content) {
        if(content.msg == 'close') {
            this.close()
        }
    },
    close: function() {
        this.tracker.stop()
        return this.get('stream').stream.then((stream) => {
            stream.getTracks().forEach((track) => {
                track.stop()
            })
        })
    }
}, {
    serializers: _.extend({
            stream: { deserialize: widgets.unpack_models },
        }, widgets.DOMWidgetModel.serializers)
});


var HeadTrackrView = widgets.DOMWidgetView.extend({
    render: function() {
        this.video_element_camera = document.createElement( 'video' );
        this.video_element_camera.setAttribute("autoplay", "")
        this.video_element_debug = document.createElement( 'video' );
        this.video_element_debug.setAttribute("autoplay", "")
        this.el.appendChild(this.video_element_camera)
        this.el.appendChild(this.video_element_debug)
        this.video_element_camera.srcObject = this.model.canvas.captureStream()
        this.video_element_debug.srcObject = this.model.canvas_debug.captureStream()
   }

});


module.exports = {
    HeadTrackrModel : HeadTrackrModel,
    HeadTrackrView : HeadTrackrView
};
