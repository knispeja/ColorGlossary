=begin
Pass me a Wikipedia .html file of a color list 
(e.g. https://en.wikipedia.org/wiki/List_of_colors:_N%E2%80%93Z)
=end

OUTPUT_FOLDER = "scraped_output"

# Command line args
file_path = ARGV.shift
raise "Requires path to *.html file from Wikipedia color list page" unless file_path
raise "Too many arguments given, must be exactly one given" unless ARGV.empty?

# Define regex helper
class String
  def string_between_markers marker1, marker2
    self[/#{Regexp.escape(marker1)}(.*?)#{Regexp.escape(marker2)}/m, 1]
  end
end

# Load in file
within_color_table = false
color_hex = nil
color_name = nil

html_file_name = file_path.split("/")[-1]
File.open(File.join(OUTPUT_FOLDER, "#{html_file_name}_out.txt"), 'w') {
    |out_file|
    IO.foreach(file_path) {
        |line|
        if within_color_table
            if line.include? "</table>"
                break
            end
            if line.include? "<th"
                color_name = line.string_between_markers(">", "</th>")
                color_name = color_name.split(">")[-1].split("<")[0] unless !color_name
                if color_name && color_name.length < 3
                    raise "Color name very short: #{color_name}"
                end
            elsif line.include? "<td"
                color_hex = line.string_between_markers(">", "</td>")
                if color_hex.include? "#"
                    color_hex = color_hex[1..-1]
                    out_file.puts "\"#{color_name}\" #{color_hex}"

                    if color_name.length < 3
                        raise "Color hex very short: #{color_hex}"
                    end
                end
            end
        elsif line.include? "<table"
            within_color_table = true
        end
    }
}