# ---------------------------------------------------------------
# name:  discourse-tsl-mods
# about: Discourse plugin with mods for TSL's EdX courses Edit
# version: 0.3.0
# author: MIT Teaching Systems Lab
# url: https://github.com/mit-teaching-systems-lab/discourse-tsl-mods
# required_version: 1.8.0.beta4
# ---------------------------------------------------------------

# This uses the `discovery-list-container-top` plugin outlet to 
# inject a form that allows the user to create their own sub-categories
# within a particular category (eg., "Groups").
enabled_site_setting :learner_groups_category_name

# Include some JS and CSS assets for http://bgrins.github.io/spectrum/
register_asset "javascripts/spectrum-1.8.0.min.js"
register_asset "stylesheets/spectrum-1.8.0.min.css"

# This adds in a new endpoint that any user can use to create a new sub-category.
# It only permits creating sub-categories with a special parent category, and 
# doesn't allow any other configuration (eg., permissions).
after_initialize do
  Discourse::Application.routes.append do
    post 'category/group' => 'categories#create_group'
  end

  CategoriesController.class_eval do
    def create_group
      log :info, "CategoriesController#create_group"
      # Check for special "Groups" category first
      group_category_name = SiteSetting.learner_groups_category_name
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
      if not @category.save
        log :info, "@category.save failed"
        return render_json_error(@category)
      end

      # Update the category definition topic and post so that the "about"
      # copy says what the user passed as the "description"
      if group_category_params.has_key?(:description)
        log :info, "Attempting to revise category description..."
        if not @category.revise(current_user, raw: group_category_params[:description])
          log :info, "@category.revise failed"
          return render_json_error(@category)
        end
      end

      # Log and return success
      log :info, "username: #{current_user.username} created category: #{@category.name}"
      return render status: 200, json: { category_url: @category.url }
    end

    private
    # Fix some parameters and limit what can be changed by the user
    def params_for_group_category(group_category_id, category_params, user)
      whitelisted_params = [
        :name,
        :description,
        :color,
        :text_color
      ]
      fixed_params = {
        permissions: {
          everyone: 1
        },
        parent_category_id: group_category_id,
        user: user
      }

      category_params.slice(*whitelisted_params).merge(fixed_params)
    end

    def log(method_symbol, text)
      msg = "CategoriesController#create_group, #{text}"
      Rails.logger.error(msg)
      puts msg
    end
  end
end