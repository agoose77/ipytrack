var toolkit = require('./artoolkit.debug.js')
var toolkit_api = require('./artoolkit.api.js')
var widgets = require('@jupyter-widgets/base');
var _ = require('lodash');
var semver_range = require('./utils.js').semver_range;

var ARToolkitControllerModel = widgets.DOMWidgetModel.extend({

    defaults: function () {
        return _.extend(widgets.WidgetModel.prototype.defaults(), {
            _model_name: 'ARToolkitControllerModel',
            _view_name: 'ARToolkitControllerView',
            _model_module: 'ipytrack',
            _view_module: 'ipytrack',
            _model_module_version: semver_range,
            _view_module_version: semver_range,
            stream: null,
            matrix_object: null,
            matrix_camera: null,
            visible: false,
        })
    },
    close: function () {
        ARToolkitControllerModel.__super__.close.apply(this, arguments);
        this.keep_running = false
    },
    onStreamLoaded: function () {

        this.get('stream').captureStream().then((stream) => {

            // Get video track data
            var track = stream.getVideoTracks()[0];
            var settings = track.getSettings();

            if (window.video !== undefined){
                video = window.video;
            }
            else{
                var video = this.el_video;
                video.videoWidth = settings.width;
                video.videoHeight = settings.height;
                video.srcObject = stream;
            }

            var param = new ARCameraParam();
            param.onload = () => {
                setTimeout(() => {
                    console.log({w: video.videoWidth, h: video.videoHeight});


                    var controller = new ARController(video.videoWidth, video.videoHeight, param);
                    controller.debugSetup();
                    var camera_mat = controller.getCameraMatrix();
                    console.log('camera_mat', camera_mat)
                    this.set('matrix_camera', Array.prototype.slice.call(camera_mat)) // convert to normal array
                    this.save_changes()

                    var marker_matrix = new Float64Array(12);
                    var gl_matrix = new Array(16)

                    console.log({this: this});

                    var tick = () => {
                        controller.detectMarker(video);
                        var marker_num = controller.getMarkerNum();

                        //console.log('marker_num', marker_num)
                        if (marker_num > 0) {

                            if (this.get('visible')) {
                                controller.getTransMatSquareCont(0, 1, marker_matrix, marker_matrix);
                            } else {
                                controller.getTransMatSquare(0, 1, marker_matrix, marker_matrix);
                                this.set('visible', true)
                                this.save_changes()
                            }
                            controller.transMatToGLMat(marker_matrix, gl_matrix);
                            this.set('matrix_object', gl_matrix.slice())
                            this.save_changes()
                        } else {
                            this.set('visible', false)
                            this.save_changes()
                        }

                        if (this.keep_running)
                            requestAnimationFrame(tick)
                    }
                    tick()

                }, 1000)


                var data = atob('AAACgAAAAeBAgwrsW6bUSwAAAAAAAAAAQHQ3KqAAAAAAAAAAAAAAAAAAAAAAAAAAQIL0K3dHyf9AbbNowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/wAAAAAAAAAAAAAAAAAAA/uWNa4AAAAL+3lTLAAAAAv17YFWAAAAA/VYLXIAAAAECCe0YgAAAAQIJlMOAAAABAdDcqoAAAAEBts2jAAAAAP+8OmzqkDy4=');
                param.load(data)
            }

        })
    },
    initialize: function () {
        ARToolkitControllerModel.__super__.initialize.apply(this, arguments);
        this.keep_running = true;
        window.last_artoolkit_controller = this;

        this.el_video = document.createElement('video');
        this.el_video.visible = false;
        document.body.appendChild(this.el_video);

        this.visible = false;
        this.get('stream').stream.then((stream) => {
            this.onStreamLoaded();
        })
    }
}, {
    serializers: _.extend({
        stream: {deserialize: widgets.unpack_models},
    }, widgets.WidgetModel.serializers)
});

var ARToolkitControllerView = widgets.DOMWidgetView.extend({
    render: function () {
        ARToolkitControllerView.__super__.render.apply(this, arguments);
        this.el_visible = document.createElement('div');
        this.el_matrix_object = document.createElement('div');
        this.el_matrix_camera = document.createElement('div');
        this.el.appendChild(this.el_visible);
        this.el.appendChild(this.el_matrix_object);
        this.el.appendChild(this.el_matrix_camera);
        this.listenTo(this.model, 'change:visble change:matrix_object', this.update_text.bind(this), this);
        this.update_text();
    },
    update_text: function () {
        this.el_visible.innerHTML = 'visible: ' + this.model.get('visible');
        this.el_matrix_object.innerHTML = 'matrix: ' + this.model.get('matrix_object');
    }


});

module.exports = {
    ARToolkitControllerModel: ARToolkitControllerModel,
    ARToolkitControllerView: ARToolkitControllerView
};
