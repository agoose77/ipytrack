import ipywidgets as widgets
from traitlets import Unicode, Float, CFloat, List, Bool, Instance
import ipytrack
import ipywebrtc

semver_range_frontend = "^" + ipytrack._version.__version_js__

@widgets.register
class HeadTrackr(widgets.DOMWidget):
    """"""
    _view_name = Unicode('HeadTrackrView').tag(sync=True)
    _model_name = Unicode('HeadTrackrModel').tag(sync=True)
    _view_module = Unicode('jupyter-track').tag(sync=True)
    _model_module = Unicode('jupyter-track').tag(sync=True)
    _view_module_version = Unicode(semver_range_frontend).tag(sync=True)
    _model_module_version = Unicode(semver_range_frontend).tag(sync=True)
    scale = CFloat(1).tag(sync=True)
    head_x = CFloat().tag(sync=True)
    head_y = CFloat().tag(sync=True)
    head_z = CFloat().tag(sync=True)
    head = List(Float).tag(sync=True)
    scales = List(CFloat, default_value=[1., 1., 1.]).tag(sync=True)
    offset = List(CFloat, default_value=[0., 0., 0.]).tag(sync=True)
    stream = Instance(ipywebrtc.MediaStream, allow_none=True).tag(sync=True, **widgets.widget_serialization)

    def close(self):
        self.send({'msg': 'close'})

class ARToolkitController(widgets.DOMWidget):
    _view_name = Unicode('ARToolkitControllerView').tag(sync=True)
    _model_name = Unicode('ARToolkitControllerModel').tag(sync=True)
    _view_module = Unicode('jupyter-track').tag(sync=True)
    _model_module = Unicode('jupyter-track').tag(sync=True)
    _view_module_version = Unicode(semver_range_frontend).tag(sync=True)
    _model_module_version = Unicode(semver_range_frontend).tag(sync=True)
    stream = Instance(ipywebrtc.MediaStream, allow_none=True).tag(sync=True, **widgets.widget_serialization)
    matrix_object = List(CFloat, default_value=[0] * 16, allow_none=True, minlen=16, maxlen=16).tag(sync=True)
    matrix_camera = List(CFloat, default_value=[0] * 16, allow_none=True, minlen=16, maxlen=16).tag(sync=True)
    visible = Bool(False).tag(sync=True)
