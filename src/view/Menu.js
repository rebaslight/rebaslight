var _ = require("lodash");
var h = require("virtual-dom/h");
var S = require("./styles");
var bus = require("../event-bus");
var cur_v = require("../../package.json").version;
var jsCSS = require("js-managed-css");
var toRlURL = require("../toRlURL");
var Effects = require("../effects");
var prevDflt = require("wrap-prevent-default");
var RLBrowser = require("../RLBrowser");

var closeWindow = RLBrowser
  ? prevDflt(RLBrowser.quit)
  : undefined;

var css_vars = jsCSS({
  ".$MenuItem": {
    "> span": {
      "cursor": "pointer"
    },
    "&:hover, &.$is_open": {
      "> span": {
        "box-shadow": "2px 2px 10px #000000",
        "background-color": S.color.highlight+" !important"
      }
    }
  },
  ".$MenuItemItem": {
    "cursor": "pointer",
    "color": S.color.text,
    "display": "block",
    "padding": ".25em 1em",
    "text-decoration": "none",
    "white-space": "nowrap",
    "&:hover": {
      "background-color": S.color.highlight+" !important"
    }
  }
});

var MenuItemItem = function(props){
  if(_.has(props.onClick, "href")){
    return h("a." + css_vars.MenuItemItem, {href: props.onClick.href}, props.label);
  }
  var onClick = _.isFunction(props.onClick) ? props.onClick : _.noop;
  //not using <a> b/c it brings up a url preview in the bottom of the page
  return h("span." + css_vars.MenuItemItem, {"ev-click": prevDflt(function(){
    bus.emit("set-currently_open_menu", undefined);
    onClick();
  })}, props.label);
};

var MenuItem = function(props){
  var id = props.id;
  var height = props.height;
  var is_open = props.is_open;
  var label = props.label;
  var items = props.items;
  return h("div." + css_vars.MenuItem + (is_open ? "." + css_vars.is_open : ""), {
    style: {
      position: "relative",
      display: "inline-block"
    }
  }, [
    h("span", {//not using <a> b/c it brings up a url preview in the bottom of the page
      style: {
        display: "inline-block",
        padding: "0 1em",
        height: height + "px",
        color: S.color.text,
        lineHeight: height + "px",
        textDecoration: "none"
      },
      "ev-click": bus.signal("set-currently_open_menu", id)
    }, label),
    is_open ? h("div", {
      style: {
        position: "fixed",
        top: height + "px",//don't stomp over the menu pickers
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: S.z_indexes.menu - 1
      },
      "ev-click": bus.signal("set-currently_open_menu", undefined)
    }) : null,
    is_open ? h("div", {
        style: {
          minWidth: "9em",
          padding: ".5em 0",
          position: "absolute",
          overflowY: "auto",
          maxHeight: "350px",
          zIndex: S.z_indexes.menu,
          boxShadow: "2px 2px 10px #000000",
          backgroundColor: S.color.main_bg,
          top: height + "px",
          left: "1px"
        }
      },
      _.map(items, function(item){
        if(item === "SEPARATOR"){
          return h("div", {
            style: {
              height: "1px",
              margin: ".25em 0",
              background: S.color.border
            }
          });
        }
        return MenuItemItem({label: item[0], onClick: item[1]});
      })
    ) : null
  ]);
};

module.exports = function(state){
  var height = S.sizes.menu_height - 2;
  var currently_open_menu = state.currently_open_menu;

  var projects_menu_items = _.map(state.projects, function(project){
    return [project.name, bus.signal("open-project", project.id)];
  });
  if(_.size(projects_menu_items) > 0){
    projects_menu_items.push("SEPARATOR");
    projects_menu_items.push(["Export", bus.signal("show-ExportModal")]);
    projects_menu_items.push("SEPARATOR");
  }
  projects_menu_items.push(["New", bus.signal("new-project")]);
  if(closeWindow){
    projects_menu_items.push(["Quit", closeWindow]);
  }

  var menu = {
    projects: {
      label: "Projects",
      items: projects_menu_items
    },
    effects: {
      label: "Effects",
      items: _.compact(_.map(Effects, function(val, key){
        return [val.human_name, bus.signal("add-layer", key)];
      }))
    },
    help: {
      label: "Help",
      items: [
        ["About", bus.signal("show-about-modal")],
        ["Contact us", {href: toRlURL("/#contact")}],
        [
          "License",
          bus.signal("UnlockModal-show")
        ],
        ["How To", {href: toRlURL("/#how-to")}]
      ]
    }
  };

  return h("div", {
    style: {
      height: height + "px",
      background: S.color.main_bg,
      borderBottom: "2px solid " + S.color.border
    }
  }, [
    _.map(menu, function(m, id){
      return MenuItem(_.assign({
        id: id,
        height: height,
        is_open: id === currently_open_menu
      }, m));
    }),
    h("a", {
        href: toRlURL("/"),
        style: {
          color: S.color.text,
          background: S.color.dark_bg,
          textDecoration: "none",
          fontWeight: "bold",
          borderRadius: "10px",
          margin: "0 0 0 10px",
          padding: "1px 12px"
        }
      },
      "Rebaslight "
      + cur_v
      + (/^0/.test(cur_v) ? ' Beta' : '')
    ),
    state.unlocked
      ? h("a", {
          href: "#",
          "ev-click": bus.signal("UnlockModal-show"),
          style: {
            color: S.color.text,
            background: S.color.dark_bg,
            textDecoration: "none",
            fontWeight: "bold",
            borderRadius: "10px",
            margin: "0 0 0 10px",
            padding: "1px 12px"
          }
        },
        "Thank You"
      )
      : h("a", {
          href: "#",
          "ev-click": bus.signal("UnlockModal-show"),
          style: {
            color: S.color.text,
            background: "#770000",
            textDecoration: "none",
            fontWeight: "bold",
            borderRadius: "10px",
            margin: "0 0 0 10px",
            padding: "1px 12px"
          }
        },
        "TRIAL VERSION"
      )
  ]);
};
