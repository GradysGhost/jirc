# 12 December, 2012

 * Added this changelog
 * Implemented URL lookup caching in `url` plugin
   * Customizable TTL for cached URLs/titles
 * Resolved Issue #11
   * When `url` "says" the page title, it checks first to see if the page title is a URL itself. If so, it uses the IRC client `say` function in lieu of the jIRC `say` function, thereby bypassing the event stack.
