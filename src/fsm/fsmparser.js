import { CmdLineScanner, EOF, NUMBER, TOKEN0, TOKEN1, TOKEN2 } from "./cmdlinescanner";

export class FSMParser {
    constructor(cmdline) {
        this.cmdline = cmdline;
        this.scanner = new CmdLineScanner(cmdline);
    }
    parse() {
        this.states = [];
        // parse --fsm-config
        const startToken = this.scanner.next();
        if (startToken.type !== TOKEN0 || startToken.value !== "fsm-config")
            throw "The command line must start with --fsm-config";
        // parse --nstates $
        const nstatesToken = this.scanner.next();
        if (nstatesToken.type !== TOKEN0 || nstatesToken.value !== "nstates")
            throw "Missing --nstates";
        const nstatesValueToken = this.scanner.next();
        if (nstatesValueToken.type !== NUMBER) 
            throw "Invalid number of states";
        // parse states and transitions
        const nstates = nstatesValueToken.value;
        for (let i = 0; i < nstates; i++) {
            this.parseState(i);
            this.parseTransitions(i);
        }
        return this.states;
    }
    parseState(stateIndex) {
        // parse --s$ $
        const stateToken = this.scanner.next();
        console.log(stateToken);
        if (stateToken.type !== TOKEN1 || stateToken.value !== "s")
            throw `Invalid --s$ token for state ${stateIndex}`;
        if (stateToken.digit1 !== stateIndex)
            throw `Invalid state number: expected ${stateIndex}, got ${stateToken.value}`;
        const stateBehaviourToken = this.scanner.next();
        if (stateBehaviourToken.type !== NUMBER)
            throw `Invalid behaviour for state ${stateIndex}`;
        this.states.push({index: stateIndex, behaviour: stateBehaviourToken.value,
            params: {}, transitions: []});
        this.parseStateParams(stateIndex);
    }
    parseStateParams(stateIndex) {
        let paramToken = this.scanner.peek();
        // loop until we encounter --n$, --s$, or the end of cmdline
        while (paramToken.type !== EOF && paramToken.value !== "s" && paramToken.value !== "n") {
            // consume the look-ahead
            this.scanner.next();
            // parse --paramName$ $
            if (paramToken.type !== TOKEN1 || paramToken.digit1 !== stateIndex)
                throw `Invalid parameters for state ${stateIndex}`;
            const paramValueToken = this.scanner.next();
            if (paramValueToken.type !== NUMBER)
                throw `Invalid value for --${paramToken.value}${stateIndex}`;
            this.states[stateIndex].params[paramToken.value] = paramValueToken.value;
            paramToken = this.scanner.peek();
        }
    }
    parseTransitions(stateIndex) {
        // check if current state has transitions (--n$ as next token)
        const transitionToken = this.scanner.peek();
        if (transitionToken.type === TOKEN1 && transitionToken.value === "n") {
            // consume the lookahead
            this.scanner.next();
            // parse --n$ $
            if (transitionToken.digit1 !== stateIndex)
                throw `Invalid --n$ token for state ${stateIndex}`;
            const transitionsNumberToken = this.scanner.next();
            if (transitionsNumberToken.type !== NUMBER)
                throw `Invalid number of transitions for state ${stateIndex}`;
            // parse the transitions
            for (let i = 0; i < transitionsNumberToken.value; i++) {
                this.parseTransition(stateIndex, i);
            }
        }
    }
    parseTransition(stateIndex, transitionIndex) {
        // parse --n$x$ $
        const transitionToken = this.scanner.next();
        console.log(transitionToken);
        const transitionEndToken = this.scanner.next();
        console.log(transitionEndToken);
        if (transitionToken.type !== TOKEN2 || transitionToken.value !== "n"
            || transitionToken.digit1 !== stateIndex || transitionToken.digit2 !== transitionIndex
            || transitionEndToken.type !== NUMBER)
            throw `Invalid transition ${stateIndex}x${transitionIndex}`;
        // parse --c$x$ $
        const conditionToken = this.scanner.next();
        const conditionValueToken = this.scanner.next();
        if (conditionToken.type !== TOKEN2 || conditionToken.value !== "c"
            || conditionToken.digit1 !== stateIndex || conditionToken.digit2 !== transitionIndex
            || conditionValueToken.type !== NUMBER)
            throw `Invalid condition ${stateIndex}x${transitionIndex}`;
        // add transition to current state
        this.states[stateIndex].transitions.push({endState: transitionEndToken.value, 
            condition: conditionValueToken.value, params: {}});
        this.parseTransitionParams(stateIndex, transitionIndex);
    }
    parseTransitionParams(stateIndex, transitionIndex) {
        let paramToken = this.scanner.peek();
        // loop until we encounter --s$, or the end of cmdline
        while (paramToken.type !== EOF && paramToken.value !== "s") { 
            // consume the look-ahead
            this.scanner.next();
            // parse --paramName$x$ $
            if (paramToken.type !== TOKEN2 || paramToken.digit1 !== stateIndex
                || paramToken.digit2 !== transitionIndex)
                throw `Invalid parameters for transition ${stateIndex}x${transitionIndex}`;
            const paramValueToken = this.scanner.next();
            if (paramValueToken.type !== NUMBER)
                throw `Invalid value for --${paramToken.value}${stateIndex}x${transitionIndex}`;
            this.states[stateIndex].transitions[transitionIndex]
                .params[paramToken.value] = paramValueToken.value;
            paramToken = this.scanner.peek();
        }
    }
}