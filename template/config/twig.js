var token = function(Twig) {
    for (var i = 0; i < Twig.token.definitions.length; i++) {
        if(Twig.token.definitions[i].type == Twig.token.type.output){
            Twig.token.definitions[i] = {
                type: Twig.token.type.output,
                open: '<%=',
                close: '%>'
            };
        }
    };
};
module.exports = token;
