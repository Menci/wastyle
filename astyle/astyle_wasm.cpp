#ifdef ASTYLE_LIB

#include <emscripten.h>
#include <string>
#include <cstring>

#include "astyle_main.h"

using namespace astyle;

EMSCRIPTEN_KEEPALIVE
extern "C" void *alloc_buffer(size_t count) {
  return malloc(count);
}

EMSCRIPTEN_KEEPALIVE
extern "C" void free_buffer(char *p) {
  free(p);
}

void string_to_buffer(const std::string &string, char **buffer)
{
  *buffer = (char *)alloc_buffer(string.length() + 1);
  strcpy(*buffer, string.c_str());
}

EMSCRIPTEN_KEEPALIVE
extern "C" bool wastyle(const char *code, const char *options_str, char **result_or_error_buffer)
{
  ASFormatter formatter;
	ASOptions options(formatter);

	std::vector<std::string> optionsVector;
	std::stringstream opt(options_str);

	options.importOptions(opt, optionsVector);

	bool ok = options.parseOptions(optionsVector, "Invalid Artistic Style options:");
	if (!ok) {
    string_to_buffer(options.getOptionErrors(), result_or_error_buffer);
    return false;
  }

	std::stringstream in(code);
	ASStreamIterator<std::stringstream> streamIterator(&in);
	std::ostringstream out;
	formatter.init(&streamIterator);

	while (formatter.hasMoreLines())
	{
		out << formatter.nextLine();
		if (formatter.hasMoreLines())
			out << streamIterator.getOutputEOL();
		else
		{
			// this can happen if the file if missing a closing brace and break-blocks is requested
			if (formatter.getIsLineReady())
			{
				out << streamIterator.getOutputEOL();
				out << formatter.nextLine();
			}
		}
	}

  string_to_buffer(out.str(), result_or_error_buffer);
  return true;
}

#endif // ASTYLE_LIB
