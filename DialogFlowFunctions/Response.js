const formatResponseForDialogflow = (texts, sessionInfo, targetFlow, targetPage) => {
    var messages = []
    texts.forEach(text => {
        messages.push(
            {
                text: {
                    text: [text],
                    redactedText: [text]
                },
                responseType: 'HANDLER_PROMPT',
                source: 'VIRTUAL_AGENT'
            }
        );
    });
    let responseData = {
        fulfillment_response: {
            messages: messages
        }
    };
    if (sessionInfo !== '') {
        responseData['sessionInfo'] = sessionInfo;
    }
    if (targetFlow !== '') {
        responseData['targetFlow'] = targetFlow;
    }
    if (targetPage !== '') {
        responseData['targetPage'] = targetPage;
    }
    return responseData
};
export{formatResponseForDialogflow}