module Jekyll
  class ImageGridTag < Liquid::Tag

    def initialize(tag_name, text, tokens)
      super
      @grid = []
      @grid << '<div class="image-grid">'
      @grid << '<div class="row">'
      text.split(' ').each_with_index do |img, i|

        if i > 0 and i % 3 == 0
          @grid << '</div><div class="row">'
        end

        @grid << '<div class="grid-item">'
        @grid << '<div class="cell background-image" '\
                 'style="background-image: url(' + img + ')"></div>'
        @grid << '</div>' 
      end
      @grid << '</div>'
      @grid << '</div>'
      @grid = @grid.join(' ')
    end

    def render(context)
      "#{@grid}"
    end
  end
end

Liquid::Template.register_tag('image_grid', Jekyll::ImageGridTag)