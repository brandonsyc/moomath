import xml.etree.ElementTree
import itertools
import random
import string
from xml.sax.saxutils import escape

nilRef = "javascript:void(0);"

def generateTippyTooltipScript(result, attribs, thash):
    jsObject = ";tippy('#%s', {" % thash

    for key in attribs:
        if key in ['title', 'href', 'id', 'class']:
            continue

        if attribs[key].isdigit() or attribs[key][0] == '[':
            jsObject += "%s: %s, " % (key, attribs[key])
        else:
            jsObject += "%s: '%s', " % (key, attribs[key])

    jsObject += '});'

    return jsObject

def generateHLJSScript(attribs, thash):
    return """;hljs.highlightBlock(document.getElementById("%s"));""" % thash

def includeJSScriptGen(script_path):
    return """</script>\n<script src="%s"></script>\n<script>""" % script_path

def escapeJSScriptGen(contf):
    return """</script>\n%s\n<script>""" % contf

def randomObjHash(length = 10):
    return 'f_' + ''.join(random.choice(string.ascii_lowercase + string.ascii_uppercase + string.digits) for _ in range(length))

tagRemove = randomObjHash() + randomObjHash()
newlineInsert = randomObjHash() + randomObjHash()
tabInsert = randomObjHash() + randomObjHash()

def addTippyModule(article):
    article.addHeaderScript(includeJSScriptGen("tippy.min.js"))

def addHighlighterModule(article):
    article.addHeaderScript(escapeJSScriptGen("""<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/highlight.min.js"></script>"""))

def parseInlineCode(inline_code, article):
    if "hljs" not in article.opts:
        addHighlighterModule(article)

    attrib = inline_code.attrib

    inline_code.tag = "span"
    attrib["id"] = randomObjHash()

    article.addFooterScript(generateHLJSScript(attrib, attrib["id"]))

    if "lang" in attrib:
        if "class" in attrib:
            attrib["class"] = ""
        attrib["class"] += attrib["lang"]
        attrib.pop("lang", None)

    if "class" in attrib:
        attrib["class"] += " inline-code"
    else:
        attrib["class"] = "cpp inline-code"

def parseReference(ref, article):
    attrib = ref.attrib
    if "to" in attrib:
        ref.tag = "a"
        ref.attrib["href"] = article.getHashByTitle(ref.attrib["to"])
        ref.attrib.pop("to", None)
    elif "sect" in attrib:
        ref.tag = "a"
        ref.attrib["href"] = hashLoc(attrib.sect)
        ref.attrib.pop("sect", None)

def parseLink(ref, article):
    attrib = ref.attrib
    ref.tag = "a"

    if "href" in attrib:
        ref.tag = "a"
        return

    if "to" in attrib:
        ref.attrib["href"] = ref.attrib["to"]
        ref.attrib.pop("to", None)

    if "noleave" not in attrib:
        attrib["target"] = "_blank"

def parseTooltip(ref, article):
    if "tippy" not in article.opts:
        addTippyModule(article)
        article.opts["tippy"] = True

    attrib = ref.attrib
    ref.tag = "a"

    if "tip" in attrib:
        attrib["title"] = attrib["tip"]
        attrib.pop("tip", None)
    if "title" not in attrib:
        raise AttributeError("No tip or title attribute for tooltip.")

    if "arrow" not in attrib:
        attrib["arrow"] = "true"
    if "delay" not in attrib:
        attrib["delay"] = "200"
    if "maxwidth" not in attrib:
        attrib["maxwidth"] = "180px"
    if "href" not in attrib:
        attrib["href"] = nilRef
    if "placement" not in attrib:
        attrib["placement"] = "bottom"

    thash = randomObjHash()
    article.addFooterScript(generateTippyTooltipScript(attrib["title"], attrib, thash))

    attrib["id"] = thash

def parseVocab(ref, article):
    attrib = ref.attrib

    if "title" not in attrib:
        attrib["title"] = article.findVocab(ref.text)

    parseTooltip(ref, article)

def parseParagraph(node, article):
    for inline_code in itertools.chain(node.iterfind('inline-code'), node.iterfind('inline'), node.iterfind('inl')):
        parseInlineCode(inline_code, article)

    for ref in itertools.chain(node.iterfind('reference'), node.iterfind('ref')):
        parseReference(ref, article)

    for ref in node.iterfind('link'):
        parseLink(ref, article)

    for ref in node.iterfind('tooltip'):
        parseTooltip(ref, article)

    for ref in node.iterfind('vocab'):
        parseVocab(ref, article)

    for ref in node.iterfind('list'):
        parseList(ref, article)

    return XMLtostr(node)

def parseCode(node, article):
    if "hljs" not in article.opts:
        addHighlighterModule(article)

    attrib = node.attrib

    node.tag = "div"
    attrib["id"] = randomObjHash()
    attrib["class"] = "code-cf"

    article.addFooterScript(generateHLJSScript(attrib, attrib["id"]))
    return XMLtostr(node)

def parseList(node, article):
    attrib = node.attrib
    if "enumeration" in attrib:
        attrib["enum"] = attrib["enumeration"]

    list_type = 0
    ordered = False
    ftype = None
    if attrib["enum"] == "number":
        ordered = True
        ftype = '1'
    elif attrib["enum"] == "upper" or attrib["enum"] == "uppercase":
        ordered = True
        ftype = 'A'
    elif attrib["enum"] == "lower" or attrib["enum"] == "lowercase":
        ordered = True
        ftype = 'a'
    elif attrib["enum"] == "roman":
        ordered = True
        ftype = 'i'

    if ordered:
        attrib["type"] = ftype
        node.tag = "ol"
    else:
        node.tag = "ul"

    attrib.pop("enum", None)
    attrib.pop("enumerate", None)

    for refc in node.getchildren():
        parseParagraph(refc, article)
        refc.tag = "li"

    print attrib, node.tag

    return XMLtostr(node)

node_type_dict = {
"p": parseParagraph,
"list": parseList,
"code": parseCode
}

def XMLtostr(node):
    return xml.etree.ElementTree.tostring(node)

def parseContentSN(node, article):
    try:
        return node_type_dict[node.tag.lower()](node, article)
    except KeyError:
        print "Unknown tag " + node.tag + "."
        return XMLtostr(node)
    except Exception, e:
        print "Error parsing tag " + node.tag + ":\n%s" % e

def parseContents(node, article):
    for subnode in node.getchildren():
        yield parseContentSN(subnode, article)

def escapeTabify(strf):
    p = ""
    for line in iter(strf.splitlines()):
        if not line or line.isspace():
            p += '\n'
            continue

        print line

        findex = -1
        for i, c in enumerate(line):
            if not c.isspace():
                findex = i
                break

        if (findex == -1):
            continue

        line = tabInsert * (findex // 2) + line[findex:]
        p += line + '\n'
    return p


def parseInclude(node, article):
    attrib = node.attrib

    if "file" in attrib:
        attrib["loc"] = attrib["file"]
    if "loc" not in attrib:
        raise AttributeError("No file location specified for include.")

    node.text = escapeTabify(open(attrib["loc"], 'r').read()).replace('\n', newlineInsert)
    node.tag = tagRemove
    del node.attrib
    node.attrib = {}

def parseIncludes(node, article):
    for include_node in node.iter("include"):
        parseInclude(include_node, article)

def parse(node, article):
    parseIncludes(node, article)
    return '<div class="content">\n%s\n</div>' % ('\n'.join(parseContents(node, article)).replace("<%s>" % tagRemove, '\n').replace("</%s>" % tagRemove, '\n').replace(newlineInsert, ' <br />\n').replace(tabInsert, '&nbsp;&nbsp;&nbsp;&nbsp;'))
