"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fleet = require("../fixtures/current-fleet.json");
const { run: assemble } = require("../src");
const { materializeKit } = require("../src/kit");

const paths = {
  capability: process.env.CURRENT_CAPABILITY_MACHINE_PATH,
  interface: process.env.CURRENT_INTERFACE_MACHINE_PATH,
  core: process.env.CURRENT_MORPHTILE_CORE_PATH
};
const commits = {
  capability: process.env.CURRENT_CAPABILITY_COMMIT,
  interface: process.env.CURRENT_INTERFACE_COMMIT,
  core: process.env.CURRENT_MORPHTILE_COMMIT
};
const ready = Object.values(paths).every(Boolean);

function req(id, goal, intent) {
  return {
    envelope_version: "0.1",
    request_id: id,
    goal,
    intent,
    provenance: { caller: "assembly-current-interface-repeat-local-receiver" }
  };
}

function uiTile(id) {
  return {
    candidate: {
      schema: "morphtile.tile-spec/v0.4",
      id,
      name: "Repeat-local receiver proof",
      form_hints: ["ui_panel"],
      facets: {}
    },
    provenance: { caller: "explicit-repeat-local-ui-base" }
  };
}

function applyImported(MT, receiver, imported) {
  for (const operation of imported.ops || []) MT.applyStructOp(receiver, operation);
}

test("current Interface repeat-local presentation survives Assembly kit transport without duplicating canonical read or action authority", { skip: !ready }, () => {
  assert.deepEqual(commits, {
    capability: fleet.capability,
    interface: fleet.interface,
    core: fleet.core
  }, "repeat-local receiver proof must bind the exact integrated Capability, Interface, and MorphTile identities");

  const Capability = require(path.resolve(paths.capability));
  const Interface = require(path.resolve(paths.interface));
  const MT = require(path.resolve(paths.core));
  const id = "mt_repeat_local_receiver";

  const capability = Capability.run(req(
    "repeat-local-capability",
    "Provide one canonical count variable and increment signal for repeated presentation",
    { kind: "counter", initial: 3 }
  ));
  const interfaceOut = Interface.run(req(
    "repeat-local-interface",
    "Render lexical repeat indices while every repeated readout and action remains a view over one canonical binding",
    {
      tile_path: id,
      title: "Repeat-local receiver proof",
      elements: [{
        kind: "repeat",
        binding: "count",
        step: 1,
        max: 4,
        children: [
          { kind: "repeat_text", source: "index", prefix: "slot " },
          { kind: "readout", binding: "count", repeat_label: { source: "index", prefix: "readout " } },
          { kind: "action", binding: "increment", repeat_label: { source: "index", prefix: "increment " } }
        ]
      }],
      bindings: { readouts: ["count"], actions: ["increment"], controls: [] }
    }
  ));

  assert.equal(capability.status, "CANDIDATE", JSON.stringify(capability.holds));
  assert.equal(interfaceOut.status, "CANDIDATE", JSON.stringify(interfaceOut.holds));
  assert.deepEqual(interfaceOut.dependencies[0].requires.readout_logic_vars, ["count"]);
  assert.deepEqual(interfaceOut.dependencies[0].requires.action_input_signal_socket_ids, ["increment"]);

  const assembled = assemble({
    envelope_version: "0.1",
    request_id: "assemble-repeat-local-interface",
    goal: "Preserve current Interface lexical presentation and canonical authority through a complete portable kit",
    intent: { id, name: "Repeat-local receiver proof" },
    inputs: [uiTile(id), capability, interfaceOut],
    provenance: { caller: "assembly-current-interface-repeat-local-receiver" }
  });

  assert.equal(assembled.status, "CANDIDATE", JSON.stringify(assembled.holds));
  assert.deepEqual(assembled.candidate.view, interfaceOut.candidate.operation.view,
    "Assembly must preserve repeat_text and readout/action repeat_label descriptors exactly rather than reinterpret them");
  assert.equal(
    assembled.candidate.facets.logic.vars.filter((variable) => variable.name === "count").length,
    1,
    "repeated readout presentation must still point at one canonical count variable"
  );
  assert.equal(
    assembled.candidate.facets.connect.sockets.filter((socket) => socket.id === "increment" && socket.kind === "signal" && socket.dir === "in").length,
    1,
    "repeated action presentation must still point at one canonical increment input signal"
  );

  const portable = materializeKit(assembled, MT, { name: "Repeat-local receiver kit" });
  assert.equal(portable.status, "CANDIDATE", JSON.stringify(portable.holds));
  assert.deepEqual(portable.kit.tile.view, assembled.candidate.view,
    "kit materialization must preserve lexical repeat presentation matter exactly");
  assert.equal(portable.dependency_resolution.length, 1);
  assert.equal(portable.dependency_resolution[0].status, "SATISFIED");

  const receiver = MT.createWorld("Repeat-local receiver");
  const imported = MT.importKit(receiver, JSON.parse(JSON.stringify(portable.kit)));
  assert.equal(imported.status, "READY", JSON.stringify(imported));
  applyImported(MT, receiver, imported);

  const received = MT.resolveTile(receiver, id);
  assert.ok(received, "fresh receiver must resolve the imported repeat-local tile");
  assert.deepEqual(received.view, assembled.candidate.view,
    "verified import must retain the exact assembled lexical presentation descriptors");
  assert.equal(
    received.facets.logic.vars.filter((variable) => variable.name === "count").length,
    1,
    "receiver matter must retain one canonical count read authority"
  );
  assert.equal(
    received.facets.connect.sockets.filter((socket) => socket.id === "increment" && socket.kind === "signal" && socket.dir === "in").length,
    1,
    "receiver matter must retain one canonical increment signal authority"
  );

  const beforeRender = MT.structHash(receiver);
  const html = MT.vnodeToHTML(MT.compilePanel(receiver).root);
  for (let index = 0; index < 3; index += 1) {
    assert.match(html, new RegExp(`slot ${index}`));
    assert.match(html, new RegExp(`readout ${index}`));
    assert.match(html, new RegExp(`increment ${index}`));
  }
  assert.equal((html.match(/readout [0-2]/g) || []).length, 3,
    "three repeated readout labels must resolve in lexical scope while reading one canonical count variable");
  assert.equal((html.match(new RegExp(`data-signal=\\"${id}:increment\\"`, "g")) || []).length, 3,
    "three repeated action views must bind back to the same canonical signal authority");
  assert.equal(MT.structHash(receiver), beforeRender,
    "receiver lexical rendering must remain structurally read-only after Assembly transport");
});
