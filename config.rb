set :css_dir, 'stylesheets'
set :js_dir, 'javascripts'
set :images_dir, 'images'

page "dashboard_subtemplates.html", :layout => false

configure :build do
  activate :relative_assets
  set :build_dir, './'
end