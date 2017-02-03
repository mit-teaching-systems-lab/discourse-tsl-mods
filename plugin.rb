# ---------------------------------------------------------------
# name:  discourse-tsl-mods
# about: Discourse plugin with mods for TSL's EdX courses Edit
# version: 0.0.1
# author: MIT Teaching Systems Lab
# url: https://github.com/mit-teaching-systems-lab/discourse-tsl-mods
# required_version: 1.8.0.beta4
# ---------------------------------------------------------------

# This uses the `discovery-list-container-top` plugin outlet to 
# inject a form that allows the user to create a special kind of Group.

# TODO(kr)
# Enable site settings in admin UI.
# See descriptions in files in the `config` folder.
# enabled_site_setting :learner_groups_category_name


# This adds in a new method for creating categories.
# It can only create categories with the parent category "Groups",
# doesn't allow any other configuration (eg., permissions),
# and allows any user to create a category like this.
after_initialize do
  Discourse::Application.routes.append do
    post 'category/group' => 'categories#create_group'
  end

  CategoriesController.class_eval do
    def create_group
      log :info, "CategoriesController#create_group"
      # TODO(kr) allow SiteSetting, not sure why this doesn't work
      # group_category_name = SiteSetting.learner_groups_category_name

      # Check for special "Groups" category first
      group_category_name = 'Groups'
      group_category = Category.find_by_name(group_category_name)
      if not group_category
        log :info, "no category found for group_category_name: #{group_category_name}"
        return render status: 500, json: failed_json
      end

      # Create the category, limiting the params
      # This is adapted from CategoriesController#create
      group_category_params = params_for_group_category(group_category.id, category_params, current_user)
      log :info, "group_category_params: #{group_category_params.inspect}"
      @category = Category.create(group_category_params)
      if @category.save
        log :info, "username: #{current_user.username} created category: #{@category.name}"
        render status: 200, json: { category_url: @category.url }
      else
        log :info, "render_json_error"
        return render_json_error(@category) unless @category.save
      end
    end

    private
    # Fix some parameters and limit what can be changed by the user
    def params_for_group_category(group_category_id, params, user)
      user_params = params.slice(*[
        :name,
        :description,
        :color,
        :text_color
      ])
      locked_params = {
        permissions: {
          everyone: 1
        },
        parent_category_id: group_category_id
      }

      user_params.merge(locked_params).merge(user: user)
    end

    def log(method_symbol, text)
      msg = "CategoriesController#create_group, #{text}"
      Rails.logger.error(msg)
      puts msg
    end
  end
end