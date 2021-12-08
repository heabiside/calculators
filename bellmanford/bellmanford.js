// XSS protection
function escape_html(string) {
    if (typeof string !== 'string') {
        return string;
    }
    return string.replace(/[&'`"<>]/g, function (match) {
        return {
            '&': '&amp;',
            "'": '&#x27;',
            '`': '&#x60;',
            '"': '&quot;',
            '<': '&lt;',
            '>': '&gt;',
        }[match]
    });
}

function trimming(string) {
    string = escape_html(string);
    if (string.length > 8) {
        document.getElementById('output').innerHTML = "Node names are too long. (max 8 characters).";
        throw new Error("Node names must be no more than 8 characters long.");
    }
    return string;
}
function check_weight(w) {
    if(Math.abs(w)>1000000000){
        document.getElementById('output').innerHTML = "Absolute value of the weight must be less than 10^9.";
        throw new Error("Too large absolute value of the weight.");
    }
}

// Output table according to the input
function GoButton() {
    maxNodes = 100;
    Edges_cnt = 100;
    document.getElementById('output').innerHTML = "";

    start = document.forms['addEdge'].elements['start'].value;
    start = trimming(start);

    nodes_name_to_id = new Map([[start, 0]]);
    nodes_id_to_name = new Array(maxNodes);
    nodes_id_to_name[0] = start;

    all_edges_infomation = document.forms['addEdge'].elements['graph'].value.split(/\r\n|\n/);
    if (all_edges_infomation.length <= Edges_cnt) Edges_cnt = all_edges_infomation.length;
    else {
        document.getElementById('output').innerHTML = "Maximum number of edges is 100.";
        throw new Error('Invalid input.');
    }

    edges = new Array(maxNodes);
    for (i = 0; i < maxNodes; i++) edges[i] = new Array();

    // Create a graph
    for (index = 0; index < Edges_cnt; index++) {
        all_edges_infomation[index] = all_edges_infomation[index].toString().trim();
        if (all_edges_infomation[index] === "") continue;
        an_edge_info = all_edges_infomation[index].split(" ");

        if (an_edge_info.length !== 3) {
            document.getElementById('output').innerHTML = "Does not match the input format.";
            throw new Error('Invalid input.');
        }

        from = trimming(an_edge_info[0]);
        to = trimming(an_edge_info[1]);
        weight = parseFloat(an_edge_info[2]);

        check_weight(weight);

        try {

            if (!nodes_name_to_id.has(from)) {
                nodes_id_to_name[nodes_name_to_id.size] = from;
                nodes_name_to_id.set(from, nodes_name_to_id.size);
            }
            if (!nodes_name_to_id.has(to)) {
                nodes_id_to_name[nodes_name_to_id.size] = to;
                nodes_name_to_id.set(to, nodes_name_to_id.size);
            }
            edges[nodes_name_to_id.get(from)].push([nodes_name_to_id.get(to), weight]);
        } catch (e) {
            document.getElementById('output').innerHTML = "Incorrect input values. (e.g. no numerical values in the weights).";
            throw new Error("Invalid input");
        }
    }

    /*-----bellmanford-----*/
    N = nodes_name_to_id.size;
    table = new Array(N + 1);
    for (i = 0; i <= N; i++) table[i] = new Array(100 + 10).fill("Infinity");

    table[0][0] = "<p style='font-family:monospace, serif; padding: 3px;'>loop→<br>node↓</p>";
    for (i = 1; i <= 109; i++) {
        table[0][i] = i - 1;

        if (i === 1) table[1][i] = `<p style="color: red">0(${start})</p>`;
        else table[1][i] = "Infinity";
    }
    for (i = 1; i <= N; i++)
        table[i][0] = escape_html(nodes_id_to_name[i - 1]);

    d = new Array(N).fill(Infinity);
    d[0] = 0;

    pred = new Array(N);
    pred[0] = 0;

    V_T = [0];

    column_id = 1, update_cnt = 0, maxLoop = 0;
    while (V_T.length !== 0) {
        // Force close after 1000 loops
        if (maxLoop >= 100) break;
        maxLoop++;


        from = V_T[0];
        V_T.splice(0, 1);
        if (nodes_id_to_name[from] === undefined) continue;
        if (edges[from] === undefined) continue;
        for (i = 0; i < edges[from].length; i++) {
            to = edges[from][i][0], weight = edges[from][i][1];

            if (d[to] > d[from] + weight) {
                update = true;
                d[to] = d[from] + weight;
                pred[to] = from;

                if (V_T.indexOf(to) === -1) {
                    V_T.push(to);
                }
            }
        }

        // change table
        for (i = 1; i <= N; i++) {
            if (d[i - 1] === Infinity) table[i][column_id] = "Infinity";
            else {
                table[i][column_id + 1] = `${d[i - 1]}(${nodes_id_to_name[pred[i - 1]]})`;
                if (V_T.indexOf(i - 1) !== -1)
                    table[i][column_id + 1] = "<p style='color: red'>" + table[i][column_id + 1] + "</p>";
            }
        }
        column_id++;
    }


    // Display table
    target = document.getElementById('output');
    htmlString = "<table border='1'>";
    for (i = 0; i <= N; i++) {
        allInfinity = true;
        htmlString = htmlString + "<tr>";
        for (j = 0; j <= maxLoop+1; j++) {
            if (i === 0 && j === 0) htmlString = htmlString + "<td>" + table[i][j] + "</td>";
            else {
                htmlString = htmlString + "<td>" + table[i][j] + "</td>";
            }

            if (table[i][j] !== "Infinity") allInfinity = false;
        }
        htmlString = htmlString + "</tr>";
    }
    htmlString = htmlString + "</table>";
    target.innerHTML = htmlString;
}

