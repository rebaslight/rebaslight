module.exports = function (project) {
  return parseInt(project && project.main_source && project.main_source.n_frames, 10) || 0
}
