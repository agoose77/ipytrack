require('./artoolkit.debug.js')
require('./artoolkit.api.js')
var widgets = require('@jupyter-widgets/base');
var _ = require('lodash');
var semver_range = require('./utils.js').semver_range;
	
var ARToolkitControllerModel = widgets.DOMWidgetModel.extend({
    defaults: function() {
        return _.extend(widgets.WidgetModel.prototype.defaults(), {
            _model_name : 'ARToolkitControllerModel',
            _view_name : 'ARToolkitControllerView',
            _model_module : 'ipytrack',
            _view_module : 'ipytrack',
            _model_module_version: semver_range,
             _view_module_version: semver_range,
            stream: null,
            matrix_object: null,
            matrix_camera: null,
            visible: false,
        })
    },
    close: function() {
        ARToolkitControllerModel.__super__.close.apply(this, arguments);
        this.keep_running = false
    },
    initialize: function() {
        ARToolkitControllerModel.__super__.initialize.apply(this, arguments);
        this.keep_running = true;

        var marker_matrix = new Float64Array(12);
        var gl_matrix = new Array(16)
        
        this.visible = false;
        this.get('stream').stream.then((stream) => {
            var param = new ARCameraParam();
            param.onload = () => {
                var controller = new ARController(this.get('stream').width, this.get('stream').height, param);
                controller.debugSetup();
                var camera_mat = arController.getCameraMatrix();
                console.log('camera_mat', camera_mat)
                var tick = () => {
                    controller.detectMarker(stream);
                    var marker_num = arController.getMarkerNum();
                    if(marker_num > 0) {

                        if(this.get('visible')) {
                            controller.getTransMatSquareCont(0, 1, marker_matrix, marker_matrix);
                        } else {
                            controller.getTransMatSquare(0, 1, marker_matrix, marker_matrix);
                            this.set('visible', true)
                            this.save_changes()
                        }
                        controller.transMatToGLMat(marker_matrix, gl_matrix);
                        this.set('matrix_object', gl_matrix.slice())
                        this.save_changes()
                    }

                    if(this.keep_running)
                        requestAnimationFrame(tick)
                }
                tick()

            }
            var data = atob('AAACgAAAAeBAgwrsW6bUSwAAAAAAAAAAQHQ3KqAAAAAAAAAAAAAAAAAAAAAAAAAAQIL0K3dHyf9AbbNowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/wAAAAAAAAAAAAAAAAAAA/uWNa4AAAAL+3lTLAAAAAv17YFWAAAAA/VYLXIAAAAECCe0YgAAAAQIJlMOAAAABAdDcqoAAAAEBts2jAAAAAP+8OmzqkDy4=');
            param.load(data)
        })
    }
    }, {
    serializers: _.extend({
        stream: { deserialize: widgets.unpack_models },
    }, widgets.WidgetModel.serializers)
});

var ARToolkitControllerView = widgets.DOMWidgetView.extend({
    render: function() {
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
    update_text: function() {
        this.el_visible.innerHTML = 'visible: ' + this.model.get('visible');
        this.el_matrix_object.innerHTML = 'matrix: ' + this.model.get('matrix_object');
    }


});

module.exports = {
    ARToolkitControllerModel : ARToolkitControllerModel,
    ARToolkitControllerView : ARToolkitControllerView
};
