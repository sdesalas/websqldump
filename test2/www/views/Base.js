window.views = window.views || {};
window.views.Base = Backbone.View.extend({
  render : function () {
    console.log('views.Base.render()');
    this.el.innerHTML = this.template(this.model.toJSON());
    $('form').hide();
    this.$el.show();
  },
  do: function(event) {
    console.log('views.Base.do()');
    var name = $(event.target).data().action,
      action = this.actions[name];
    if (action) {
      action.call(this, event.target);
    } 
  },
  val: function(name) {
    console.log('views.Base.val()');
    var $node = this.$el.find('[name=' + name + ']');
    if ($node[0]) {
      if ($node[0].nodeName === 'INPUT') {
        switch($node[0].type) {
          case 'radio':
          case 'checkbox':
            return this.$el.find('[name=' + name + ']:checked').val();
          default:
            return $node.val();
        }
      } else {
        return $node.val();
      }
    }
    return null;
  },
  change: function(event) {
    console.log('views.Base.change()');
    var elem = event.target,
        name = elem.name;
    if (name && this.model.toJSON().hasOwnProperty(elem.name)) {
      this.model.set(name, $(elem).val());
    }
  }
});