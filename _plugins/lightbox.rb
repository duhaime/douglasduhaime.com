module Jekyll
  class LightboxTag < Liquid::Tag

    def initialize(tag_name, text, tokens)
      super
      @text = text
    end

    def render(context)
      @baseurl = context.registers[:site].config['baseurl']
      @lightbox = []
      @hash = rand(0..2**32).to_s

      text = @text.strip!

      if text.end_with? '-background'
        @url = @baseurl + text.chomp('-background')
        @lightbox << '<a class="default-image background-image"'
        @lightbox << ' href="#' + @hash + '"'
        @lightbox << ' style="background-image:url(' + @url + ');" >'
        @lightbox << '</a>'
      else
        @url = @baseurl + text
        @lightbox << '<a class="default-image" href="#' + @hash + '">'
        @lightbox << '<img src="' + @url + '" alt="lightbox image">'
        @lightbox << '</a>'
      end

      @lightbox << '<a href="#_" class="lightbox" id="' + @hash + '">'
      @lightbox << '<img src="' + @url + '" alt="lightbox image">'
      @lightbox << '</a>'
      @lightbox = @lightbox.join(' ')
      "#{@lightbox}"
    end
  end
end

Liquid::Template.register_tag('lightbox', Jekyll::LightboxTag)