module Jekyll
  class BackgroundImageTag < Liquid::Tag

    def initialize(tag_name, text, tokens)
      super
      @div = []
      @div << '<div class="background-image" '\
              'style="background-image: url(' + text + ')>'\
              '</div>'
      @div = @div.join(' ')
    end

    def render(context)
      "#{@div}"
    end
  end
end

Liquid::Template.register_tag('background_image', Jekyll::BackgroundImageTag)