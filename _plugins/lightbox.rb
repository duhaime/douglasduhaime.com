module Jekyll
  class LightboxTag < Liquid::Tag

    def initialize(tag_name, text, tokens)
      super
      @lightbox = []
      @hash = rand(0..2**32).to_s

      @lightbox << '<a class="default-image" href="#' + @hash + '">'
      @lightbox << '<img src="' + text + '" alt="lightbox image">'
      @lightbox << '</a>'

      @lightbox << '<a href="#_" class="lightbox" id="' + @hash + '">'
      @lightbox << '<img src="' + text + '" alt="lightbox image">'
      @lightbox << '</a>'
      @lightbox = @lightbox.join(' ')
    end

    def render(context)
      "#{@lightbox}"
    end
  end
end

Liquid::Template.register_tag('lightbox', Jekyll::LightboxTag)