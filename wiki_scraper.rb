=begin
Pass me a Wikipedia .html file of a color list 
(e.g. https://en.wikipedia.org/wiki/List_of_colors:_N%E2%80%93Z)
=end

# Command line args
file_path = ARGV.shift
raise "Requires path to *.html file from Wikipedia color list page" unless file_path
raise "Too many arguments given, must be exactly one given" unless ARGV.empty?

# Load in file
within_color_table = false
IO.foreach(file_path) {
    |line|
    if within_color_table
        if line.include? "</table>"
            break
        end
        puts line
    elsif line.include? "<table"
        within_color_table = true
    end
}